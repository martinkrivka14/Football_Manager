import prisma from "../../../lib/db";
export async function pushPlayersToDb(apiData: any) {

    const playersArray = apiData.response;

    if (!playersArray || !Array.isArray(playersArray)) {
        console.error("Data do not have response");
        return;
    }

const playersToInsert = playersArray
    .filter((item: any) => item?.player?.id != null) 
    .map((item: any) => ({
        
        
        id: Number(item.player.id),
        name: item.player.name || "null",
        firstname: item.player.firstname || "null",
        lastname: item.player.lastname || "null",
        age: Number(item.player.age) || null,
        nationality: item.player.nationality || "null",
        height: Number(item.player.height) || null,
        weight: Number(item.player.weight) || null,
        jerseyNumber: Number(item.player.number) || null,
        position: item.player.position || "null",
        photo: item.player.photo || "null",
    }));



        const hasInvalidId = playersToInsert.some(t => isNaN(t.id));
        console.log("Any NaN IDs?:", hasInvalidId);

        if (hasInvalidId) {
            console.error("Found players with invalid IDs!", playersToInsert.filter(t => isNaN(t.id)));
        }

    const batchSize = 10;
    const totalRecords = playersToInsert.length;
    const summary = { inserted: 0, batches: 0 };

    for (let i = 0; i < totalRecords; i += batchSize) {
        
    
        const chunk = playersToInsert.slice(i, i + batchSize);

        try {
        
            const result = await prisma.player.createMany({
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

    console.log(`Task complete. Total players inserted: ${summary.inserted}`);
}
