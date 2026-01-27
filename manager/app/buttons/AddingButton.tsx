'use server';

import Image from "next/image";
import prisma from "../../lib/db";


interface AddingButtonProps {
    name: string;
    location: string;
    surface: string;
    capacity: number;
}

export async function AddingButton({ name, location, surface, capacity}: AddingButtonProps) {

      const pitch = await prisma.pitch.create({
        data: {
        name: name,
        location: location,
        surface: surface,
        capacity: capacity,
        createdAt: new Date(),
        updatedAt: new Date(),
        },
      });
    
    return pitch;

}