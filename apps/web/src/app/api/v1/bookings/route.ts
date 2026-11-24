import { NextResponse } from "next/server";
import { createLead, getBookingByRef } from "@herrglow/core";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createLead(body);

    if (!result.ok) {
      return NextResponse.json({ ok: false, errors: result.errors }, { status: 400 });
    }

    return NextResponse.json(
      {
        ok: true,
        bookingId: result.bookingId,
        ref: result.ref,
        leadId: result.leadId,
        outOfArea: result.outOfArea,
        amount: result.amount,
        finalAmount: result.finalAmount,
        message: result.outOfArea
          ? "Request recorded. We will inform you when we reach your area."
          : "Appointment request received successfully. Our coordinator will call to confirm your slot.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in POST /api/v1/bookings:", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to process booking request. Please try again shortly or contact support on WhatsApp.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get("ref");

    if (!ref) {
      return NextResponse.json(
        { ok: false, error: "Missing required query parameter 'ref'" },
        { status: 400 }
      );
    }

    const booking = await getBookingByRef(ref);
    if (!booking) {
      return NextResponse.json(
        { ok: false, error: `Booking reference '${ref}' was not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, booking });
  } catch (err) {
    console.error("Error in GET /api/v1/bookings:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error looking up booking." },
      { status: 500 }
    );
  }
}
