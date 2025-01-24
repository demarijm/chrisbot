// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import csvParser from 'csv-parser';

const prisma = new PrismaClient();

async function main() {
	// Path to your CSV file
	const csvFilePath = './tpa.csv';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const districts: Array<any> = [];

	// 1) Read the CSV into an in-memory array
	await new Promise<void>((resolve, reject) => {
		fs.createReadStream(csvFilePath)
			.pipe(csvParser())
			.on('data', (row) => {
				// Each row is an object with keys matching your CSV headers
				districts.push(row);
			})
			.on('end', () => {
				console.log('Finished reading CSV');
				resolve();
			})
			.on('error', (err) => {
				console.error('Error reading CSV:', err);
				reject(err);
			});
	});

	// 2) For each row, insert or update in the DB
	for (const row of districts) {
		const {
			State,
			County,
			City,
			'NCES ID': ncesId,
			'District / Orgs': districtName,
			'TPA Name': tpaName,
			NLG,
			Midland,
			'Others 403b Vendors Names': vendors403b,
			'Others 403b Vendors Links': vendors403bLinks,
			'Others 457b Vendors Names': vendors457b,
			'Others 457b Vendors Links': vendors457bLinks
		} = row;

		// 2a) Create or upsert the District
		const district = await prisma.district.upsert({
			where: { name: districtName },
			update: {
				state: State,
				county: County,
				city: City,
				ncesId,
				tpaName
			},
			create: {
				name: districtName,
				state: State,
				county: County,
				city: City,
				ncesId,
				tpaName
			}
		});

		// 2b) Now parse the vendor data. For example, if "NLG" is '1' or '0', treat it as a boolean:
		if (NLG && Number(NLG) === 1) {
			// Create or upsert a Carrier representing NLG
			await prisma.carrier.create({
				data: {
					name: 'NLG',
					type: 'NLG', // if using VendorType enum
					recommended: false,
					districtId: district.id
				}
			});
		}

		if (Midland && Number(Midland) === 1) {
			// Create or upsert a Carrier representing Midland
			await prisma.carrier.create({
				data: {
					name: 'Midland',
					type: 'MIDLAND',
					recommended: false,
					districtId: district.id
				}
			});
		}

		// 2c) Handle "Others 403b" or "Others 457b" columns
		// If your CSV uses commas to separate multiple vendors, split them:
		const vendor403bNames = vendors403b ? vendors403b.split(',') : [];
		const vendor403bLinks = vendors403bLinks ? vendors403bLinks.split(',') : [];

		for (let i = 0; i < vendor403bNames.length; i++) {
			const name = vendor403bNames[i]?.trim();
			const link = vendor403bLinks[i]?.trim();
			if (name && name !== 'None') {
				await prisma.carrier.create({
					data: {
						name,
						link,
						type: 'B403', // or "OTHER" if you prefer
						recommended: false,
						districtId: district.id
					}
				});
			}
		}

		const vendor457bNames = vendors457b ? vendors457b.split(',') : [];
		const vendor457bLinks = vendors457bLinks ? vendors457bLinks.split(',') : [];

		for (let i = 0; i < vendor457bNames.length; i++) {
			const name = vendor457bNames[i]?.trim();
			const link = vendor457bLinks[i]?.trim();
			if (name && name !== 'None') {
				await prisma.carrier.create({
					data: {
						name,
						link,
						type: 'B457',
						recommended: false,
						districtId: district.id
					}
				});
			}
		}
	}

	console.log('Seeding complete!');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
