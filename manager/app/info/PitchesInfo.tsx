import prisma from "../../lib/db";

export async  function PitchesInfo() {
    const pitches = await prisma.pitch.findMany();
    return (<div>
        <h1>Pitches Information</h1>
        {pitches.map((pitch) => (
            <div className="mb-4" key={pitch.id}>
                <p  className="">Name: {pitch.name}</p>
                <p>Location: {pitch.location}</p>
                <p>Surface: {pitch.surface}</p>
                <p>Capacity: {pitch.capacity}</p>
            </div>
        ))}
    </div>)
}