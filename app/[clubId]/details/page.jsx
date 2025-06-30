"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Pencil } from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ClubDetailsPage() {
    const router = useRouter();
    const { clubId } = useParams();
    const [form, setForm] = useState({
        representative: "",
        dob: "",
        phone_number: "",
        email: "",
        name: "",
        user_email: "",
        master_name: "",
        address: "",
    });
    const [editMode, setEditMode] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        async function fetchClub() {
            const { data, error } = await supabase
                .from("clubs")
                .select("*")
                .eq("club_id", clubId)
                .single();
            if (data) {
                setForm({
                    representative: data.representative || "",
                    dob: data.dob || "",
                    phone_number: data.phone_number || "",
                    email: data.email || "",
                    name: data.name || "",
                    user_email: data.user_email || "",
                    master_name: data.master_name || "",
                    address: data.address || "",
                });
            }
        }
        if (clubId) fetchClub();
    }, [clubId]);


    function handleChange(e) {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        const { error } = await supabase
            .from("clubs")
            .update({
                representative: form.representative,
                dob: form.dob,
                phone_number: form.phone_number,
                email: form.email,
                name: form.name,
                user_email: form.user_email,
                master_name: form.master_name,
                address: form.address,
            })
            .eq("club_id", clubId?.toUpperCase());
        setSubmitting(false);
        if (!error) setEditMode(false);
        
    }

    useEffect(() => {
        if (!submitting && editMode) {
            setEditMode(false);
        }
    }, [submitting]);

    return (
        <div className="relative min-h-screen h-screen md:h-auto bg-black/70 flex items-center justify-center">
            <button
                type="button"
                onClick={() => router.back()}
                className="fixed top-2 left-2 z-30 flex text-sm items-center text-white p-2 shadow-lg"
                aria-label="Back"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                <span className="hidden sm:inline ml-1">Back</span>
            </button>
            <form
                onSubmit={handleSubmit}
                className="relative bg-white border border-black rounded-lg shadow-lg p-4 sm:p-6 w-[95vw] max-w-3xl flex flex-col items-center"
            >
                {!editMode && (
                    <button
                        type="button"
                        aria-label="Edit Club Details"
                        className="absolute top-4 right-4 text-black hover:text-gray-700"
                        onClick={() => setEditMode(true)}
                    >
                        <Pencil size={16} />
                    </button>
                )}
                <div className="flex flex-col md:flex-row w-full gap-6">
                    <div className="flex-1 flex flex-col gap-1 order-1">
                        <h2 className="text-lg font-extrabold text-black mb-1 text-center md:text-left">User Details</h2>
                        <label className="text-[12px] text-black font-semibold">First Name</label>
                        <input
                            type="text"
                            name="representative"
                            placeholder="Name"
                            value={form.representative || ""}
                            onChange={handleChange}
                            required
                            className="w-full text-black p-2 border border-black rounded"
                            disabled={!editMode}
                        />
                        <label className="text-[12px] text-black font-semibold">Email</label>
                        <input
                            type="text"
                            name="user_email"
                            placeholder="Email"
                            value={form.user_email || ""}
                            onChange={handleChange}
                            required
                            className="w-full text-black p-2 border border-black rounded"
                            disabled
                        />
                        <label className="text-[12px] text-black font-semibold">Phone Number</label>
                        <input
                            type="tel"
                            name="phone_number"
                            placeholder="+60 12-345 6789"
                            value={form.phone_number || ""}
                            onChange={handleChange}
                            required
                            className="w-full text-black p-2 border border-black rounded"
                            disabled={!editMode}
                        />
                        <label className="text-[12px] text-black font-semibold">Club Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Club Name"
                            value={form.name || ""}
                            onChange={handleChange}
                            required
                            className="w-full text-black p-2 border border-black rounded"
                            pattern=".{2,}"
                            title="Club name must be at least 2 characters"
                            disabled={!editMode}
                        />
                    </div>
                    <div className="flex-1 flex flex-col gap-1 mt-6 md:mt-0 order-2 md:order-3">
                        <h2 className="text-lg font-extrabold text-black mb-1 text-center md:text-left">Club Details</h2>
                        <label className="text-[12px] text-black font-semibold">Club Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Club Email"
                            value={form.email || ""}
                            onChange={handleChange}
                            required
                            className="w-full text-black p-2 border border-black rounded"
                            disabled={!editMode}
                        />
                        <label className="text-[12px] text-black font-semibold">Master Full Name</label>
                        <input
                            type="text"
                            name="master_name"
                            placeholder="Master Full Name"
                            value={form.master_name || ""}
                            onChange={handleChange}
                            required
                            className="w-full text-black p-2 border border-black rounded"
                            disabled={!editMode}
                        />
                        <label className="text-[12px] text-black font-semibold">Address</label>
                        <textarea
                            name="address"
                            placeholder="Address"
                            value={form.address || ""}
                            onChange={handleChange}
                            required
                            rows={1}
                            className="w-full text-black p-2 border border-black rounded resize-none md:h-auto"
                            style={{ height: "105px", minHeight: "105px", maxHeight: "150px" }}
                            disabled={!editMode}
                        />
                    </div>
                </div>
                {editMode && (
                    <div className="w-full border-t border-white my-4" />
                )}
                <div className="w-full flex justify-center">
                    {editMode && (
                        <button
                            type="submit"
                            className={`w-48 bg-black text-white font-bold py-2 rounded hover:bg-gray-800 ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={submitting}
                        >
                            {submitting ? "Submitting..." : "Submit"}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}