'use client';
import React from "react";
import { AddingButton } from "../buttons/AddingButton";


export default function FormForPitch() {

    const [name, setName] = React.useState("");
    const [location, setLocation] = React.useState("");
    const [surface, setSurface] = React.useState("");
    const [capacity, setCapacity] = React.useState(0);

    return(
        <><button onClick={() => AddingButton({ name, location, surface, capacity })}>Add Pitch</button>
        <form>

            <label>Enter pitch name:
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </label>

            <label>Pitch location:
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </label>

            <label>Pitch surface:
                <input type="text" value={surface} onChange={(e) => setSurface(e.target.value)} />
            </label>

            <label>Pitch capacity:
                <input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
            </label>

        </form></>
    );
}