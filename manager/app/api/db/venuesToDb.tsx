import prisma from "../../../lib/db";

export async function pushVenuesToDb(apiData: any) {

    const venuesArray = apiData.response;

    if (!venuesArray || !Array.isArray(venuesArray)) {
        console.error("Data do not have response");
        return;
    }

const venuesToInsert = venuesArray
    .filter((item: any) => item?.venue?.id != null) 
    .map((item: any) => ({
         
            id: Number(item.venue.id),
            name: item.venue.name || "null",
            address: item.venue.address || "null",
            city: item.venue.city || "null",
            capacity: Number(item.venue.capacity) || null,
            surface: item.venue.surface || "null",
            image: item.venue.image || "null",
            teamId: Number(item.team.id)

    }));

        const hasInvalidId = venuesToInsert.some(t => isNaN(t.id));
        console.log("Any NaN IDs?:", hasInvalidId);

        if (hasInvalidId) {
            console.error("Found venues with invalid IDs!", venuesToInsert.filter(t => isNaN(t.id)));
        }

    const batchSize = 10;
    const totalRecords = venuesToInsert.length;
    const summary = { inserted: 0, batches: 0 };

    for (let i = 0; i < totalRecords; i += batchSize) {
        
    
        const chunk = venuesToInsert.slice(i, i + batchSize);

        try {
        
            const result = await prisma.venue.createMany({
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

    console.log(`Task complete. Total venues inserted: ${summary.inserted}`);
}