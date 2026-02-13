import prisma from "../../../lib/db";

export async function pushTeamsToDb(apiData: any) {

    const teamsArray = apiData.response;

    if (!teamsArray || !Array.isArray(teamsArray)) {
        console.error("Data do not have response");
        return;
    }

const teamsToInsert = teamsArray
    .filter((item: any) => item?.team?.id != null) 
    .map((item: any) => ({
        
        id: Number(item.team.id),
        name: item.team.name || null,
        code: item.team.code || "null",
        country: item.team.country || null,
        founded: (item.team.founded && !isNaN(item.team.founded)) 
            ? Number(item.team.founded) 
            : null,
        national: Boolean(item.team.national),
        logo: item.team.logo || null,
       /* venue: item.venue
      ? {
          connectOrCreate: {
            where: { id: Number(item.venue.id) },
            create: {
              id: Number(item.venue.id),
              name: item.venue.name || "null",
              address: item.venue.address || "null",
              city: item.venue.city || "null",
              capacity: Number(item.venue.capacity) || null,
              surface: item.venue.surface || "null"
            }
          }
        }
      : undefined*/
    }));

        const hasInvalidId = teamsToInsert.some(t => isNaN(t.id));
        console.log("Any NaN IDs?:", hasInvalidId);

        if (hasInvalidId) {
            console.error("Found teams with invalid IDs!", teamsToInsert.filter(t => isNaN(t.id)));
        }

    const batchSize = 10;
    const totalRecords = teamsToInsert.length;
    const summary = { inserted: 0, batches: 0 };

    for (let i = 0; i < totalRecords; i += batchSize) {
        
    
        const chunk = teamsToInsert.slice(i, i + batchSize);

        try {
        
            const result = await prisma.team.createMany({
                data: chunk,
                skipDuplicates: true,
            });

            summary.inserted += result.count;
            summary.batches++;
            
            console.log(`Successfully processed batch ${summary.batches}`);
        } catch (error) {
            console.error(`Failed to insert batch starting at index ${i}:`, error);
            return;
        }
    }

    console.log(`Task complete. Total teams inserted: ${summary.inserted}`);
}

