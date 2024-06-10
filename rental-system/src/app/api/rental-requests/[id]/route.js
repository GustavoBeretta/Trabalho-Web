import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/mongodb";
import RentalRequest from "../../../../../models/rental_request";

export async function PUT(request, {params}) {
    const {id} = params;
    const {newStatus: status} = request.json()
    await connectMongoDB();
    await RentalRequest.findByIdAndUpdate(id, {status});
    return NextResponse.json({message: "Rental request updated"}, {status: 200});
}

export async function GET(request, {params}) {
    const {id} = params;
    await connectMongoDB();
    const request = RentalRequest.findOne({_id: id});
    return NextResponse.json({request}, {status: 200});
}