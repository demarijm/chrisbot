// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import csvParser from 'csv-parser';

const prisma = new PrismaClient();

/**
 * Returns a trimmed string, or an empty string if the input is falsy or "None".
 */
function cleanString(value?: string): string {
	if (!value) return '';
	if (value.trim().toLowerCase() === 'none') return '';
	return value.trim();
}

/**
 * Returns a number, defaulting to 0 if the input is empty or not a valid number.
 */
function cleanNumber(value?: string): number {
	if (!value || value.trim().toLowerCase() === 'none') return 0;
	const parsed = Number(value);
	return isNaN(parsed) ? 0 : parsed;
}

async function main() {
	// Path to your CSV file
	const csvFilePath = './tpa-second.csv';

	// In-memory store for CSV rows
	const districts: Array<Record<string, string>> = [];

	// 1) Read the CSV into an array
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
		const State = cleanString(row['State']);
		const County = cleanString(row['County']);
		const City = cleanString(row['City']);
		const ncesId = cleanString(row['NCES ID']);
		const districtName = cleanString(row['District / Orgs']);
		const tpaName = cleanString(row['TPA Name']);

		// Convert NLG / Midland columns to numbers
		const NLG = cleanNumber(row['NLG']); // 0 if empty
		const Midland = cleanNumber(row['Midland']); // 0 if empty

		// Pull in "Others" columns, and clean them
		const rawVendors403b = cleanString(row['Others 403b Vendors Names']);
		const rawVendors403bLinks = cleanString(row['Others 403b Vendors Links']);
		const rawVendors457b = cleanString(row['Others 457b Vendors Names']);
		const rawVendors457bLinks = cleanString(row['Others 457b Vendors Links']);

		// 2a) Skip if District Name is missing
		if (!districtName) {
			console.warn('Skipping row with no district name:', row);
			continue;
		}

		// 2b) Upsert the District
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

		// 2c) Always create the "NLG" carrier (recommended = true if NLG === 1, else false)
		await prisma.carrier.create({
			data: {
				name: 'NLG',
				type: 'NLG', // e.g., matches VendorType.NLG enum
				recommended: NLG === 1,
				districtId: district.id
			}
		});

		// 2d) Always create the "Midland" carrier (recommended = true if Midland === 1, else false)
		await prisma.carrier.create({
			data: {
				name: 'Midland',
				type: 'MIDLAND', // e.g., matches VendorType.MIDLAND enum
				recommended: Midland === 1,
				districtId: district.id
			}
		});

		// 2e) Handle "Others 403b" columns
		// Split multiple vendor names/links by comma
		const vendor403bNames = rawVendors403b
			? rawVendors403b
					.split(',')
					.map((v) => v.trim())
					.filter(Boolean)
			: [];
		const vendor403bLinks = rawVendors403bLinks
			? rawVendors403bLinks
					.split(',')
					.map((v) => v.trim())
					.filter(Boolean)
			: [];

		for (let i = 0; i < vendor403bNames.length; i++) {
			const name = vendor403bNames[i];
			const link = vendor403bLinks[i] || ''; // might not have a link for each name

			if (name) {
				await prisma.carrier.create({
					data: {
						name,
						link,
						type: 'B403',
						recommended: false,
						districtId: district.id
					}
				});
			}
		}

		// 2f) Handle "Others 457b" columns
		const vendor457bNames = rawVendors457b
			? rawVendors457b
					.split(',')
					.map((v) => v.trim())
					.filter(Boolean)
			: [];
		const vendor457bLinks = rawVendors457bLinks
			? rawVendors457bLinks
					.split(',')
					.map((v) => v.trim())
					.filter(Boolean)
			: [];

		for (let i = 0; i < vendor457bNames.length; i++) {
			const name = vendor457bNames[i];
			const link = vendor457bLinks[i] || '';

			if (name) {
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

// Run the main seeding function, disconnect the client afterwards
main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (error) => {
		console.error(error);
		await prisma.$disconnect();
		process.exit(1);
	});
