'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Image from "next/image";
import { Pencil } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ClubCompetitorsPage({ params }) {
    const router = useRouter();
    const { clubId } = React.use(params);
    const [clubData, setClubData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editClub, setEditClub] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function fetchClubData() {
            setLoading(true);
            const { data, error } = await supabase
                .from('competitors')
                .select('*')
                .eq('club_id', clubId);
            if (!error) setClubData(data || []);
            setLoading(false);
        }
        fetchClubData();
    }, []);

    const handleEdit = (club) => {
        setEditClub(club);
        setEditValues(club);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        
        const { data: clubData, error: clubError } = await supabase
            .from('clubs')
            .select('name')
            .eq('club_id', clubId)
            .single();

        if (clubError || !clubData) {
            alert('Could not fetch club name.');
            setSubmitting(false);
            return;
        }

        const clubName = clubData.name;
        const { club_id, ...updateData } = editValues;
        
        const { error } = await supabase
            .from('competitors')
            .update(updateData)
            .eq('club_id', club_id)
            .eq('id_number', editClub.id_number);
            
        if (!error) {
            try {
                await fetch("/api/update/update-competitors", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        oldIdNumber: editClub.id_number,
                        fullName: editValues.full_name,
                        dob: editValues.date_of_birth,
                        catagory: editValues.catagory,
                        gender: editValues.gender,
                        idNumber: editValues.id_number,
                        height: editValues.height,
                        weight: editValues.weight,
                        kup: editValues.kup,
                        events: editValues.events,
                        fee: editValues.fee,
                        schoolClub: clubName,
                    }),
                });
            } catch (err) {
                console.error("Failed to update Google Sheets", err);
            }

            setLoading(true);
            const { data } = await supabase.from('competitors').select('*').eq('club_id', clubId);
            setClubData(data || []);
            setEditClub(null);
            setLoading(false);
        } else {
            alert('Update failed!');
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <Image
                    src="/logos/VMALogo.png"
                    alt="Loading"
                    width={80}
                    height={80}
                    className="animate-pulse"
                />
            </div>
        );
    }

    return (
        <div className="p-6">
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
            <h1 className="text-2xl font-bold mb-4 text-center">Competitors</h1>
            <table className="min-w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-black">
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Full Name</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Date of Birth</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Category</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Gender</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">ID Number</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Height</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Weight</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Kup</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Events</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">FEE</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-black">Edit</th>
                    </tr>
                </thead>
                <tbody>
                    {clubData.map((club) => (
                        <tr key={club.id_number || `${club.club_id}-${club.full_name}-${club.date_of_birth}`}>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.full_name}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.date_of_birth}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.catagory}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.gender}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.id_number}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.height}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.weight}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.kup}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.events}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.fee}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-white">
                                <button
                                    type="button"
                                    title="Edit"
                                    className="cursor-pointer text-white hover:text-gray-700"
                                    onClick={() => handleEdit(club)}
                                >
                                    <Pencil className="inline w-3 h-3" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {clubData.length === 0 && (
                        <tr>
                            <td colSpan={12} className="py-4 text-center text-gray-500 border-b border-gray-300">
                                No competitors found for this club.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {editClub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="relative bg-white border border-black rounded-lg shadow-lg p-4 sm:p-6 w-[95vw] max-w-3xl flex flex-col items-center"
                        style={{ maxHeight: "95vh", minHeight: "90vh" }}>
                        <button
                            className="absolute top-2 right-2 text-black text-xl font-bold"
                            onClick={() => setEditClub(null)}
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <h2 className="text-md sm:text-md font-bold text-black text-center w-full">
                            VMA Junior Championship 2025 Registration
                        </h2>
                        <div className="flex flex-col mt-3 md:flex-row w-full gap-6">
                            <div className="flex-1 flex flex-col gap-1 order-1">
                                <label className="text-[12px] text-black font-semibold">Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={editValues.full_name || ""}
                                    onChange={handleChange}
                                    className="w-full text-black p-2 border border-black rounded bg-gray-100"
                                />
                                <label className="text-[12px] text-black font-semibold">Date of Birth</label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={editValues.date_of_birth || ""}
                                    onChange={handleChange}
                                    className="w-full text-black p-2 border border-black rounded bg-gray-100"
                                />
                                <label className="text-[12px] text-black font-semibold">Gender</label>
                                <input
                                    type="text"
                                    name="gender"
                                    value={editValues.gender || ""}
                                    onChange={handleChange}
                                    className="w-full text-black p-2 border border-black rounded bg-gray-100"
                                />
                                <label className="text-[12px] text-black font-semibold">I/C or Passport No</label>
                                <input
                                    type="text"
                                    name="id_number"
                                    value={editValues.id_number || ""}
                                    onChange={handleChange}
                                    className="w-full text-black p-2 border border-black rounded bg-gray-100"
                                />
                            </div>
                            <div className="hidden md:block w-px bg-black md:order-2" />
                            <div className="flex-1 flex flex-col gap-1 mt-6 md:mt-0 order-2 md:order-3">
                                <label className="text-[12px] text-black font-semibold">Height (CM)</label>
                                <input
                                    type="number"
                                    name="height"
                                    value={editValues.height || ""}
                                    onChange={handleChange}
                                    className="w-full text-black p-2 border border-black rounded bg-gray-100"
                                />                                
                                <label className="text-[12px] text-black font-semibold">Weight (KG)</label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={editValues.weight || ""}
                                    onChange={handleChange}
                                    className="w-full text-black p-2 border border-black rounded bg-gray-100"
                                />
                                <label className="text-[12px] text-black font-semibold">Kup</label>
                                <select
                                    name="kup"
                                    value={editValues.kup || ""}
                                    onChange={handleChange}
                                    required
                                    className="w-full text-black p-2 border border-black rounded"
                                >
                                    <option value="" disabled>Select Kup</option>
                                    <option value="1st Kup">1st Kup (Red-Black)</option>
                                    <option value="2nd Kup">2nd Kup (Red)</option>
                                    <option value="3rd Kup">3rd Kup (Blue-Red)</option>
                                    <option value="4th Kup">4th Kup (Blue)</option>
                                    <option value="5th Kup">5th Kup (Green-Blue)</option>
                                    <option value="6th Kup">6th Kup (Green)</option>
                                    <option value="7th Kup">7th Kup (Yellow-Green)</option>
                                    <option value="8th Kup">8th Kup (Yellow)</option>
                                    <option value="9th Kup">9th Kup (White-Yellow)</option>
                                    <option value="10th Kup">10th Kup (White)</option>
                                </select>
                                <div className="flex flex-col gap-2 ">
                                    <label className="text-[12px] text-black font-bold">Events</label>
                                    <div className="flex gap-4">
                                        {["Pattern", "Sparring"].map(eventName => {
                                            const eventsArr = (editValues.events || "")
                                                .split(",")
                                                .map(ev => ev.trim().toLowerCase())
                                                .filter(Boolean);
                                            const checked = eventsArr.includes(eventName.toLowerCase());
                                            return (
                                                <label key={eventName} className="flex items-center text-[12px] text-black gap-2">
                                                    <input
                                                        type="checkbox"
                                                        name={eventName.toLowerCase()}
                                                        checked={checked}
                                                        onChange={e => {
                                                            let events = (editValues.events || "")
                                                                .split(",")
                                                                .map(ev => ev.trim())
                                                                .filter(Boolean);
                                                            if (e.target.checked) {
                                                                if (!events.map(ev => ev.toLowerCase()).includes(eventName.toLowerCase())) {
                                                                    events.push(eventName);
                                                                }
                                                            } else {
                                                                events = events.filter(ev => ev.toLowerCase() !== eventName.toLowerCase());
                                                            }
                                                            setEditValues(prev => ({
                                                                ...prev,
                                                                events: events.join(", ")
                                                            }));
                                                        }}
                                                        className="accent-black"
                                                    />
                                                    {eventName}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full border-t border-white my-4" />
                        <div className="w-full flex justify-center gap-4">
                            <button
                                type="button"
                                className="w-48 bg-gray-300 text-black font-bold py-2 rounded hover:bg-gray-400"
                                onClick={() => setEditClub(null)}
                                disabled={submitting}
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className="w-48 bg-black text-white font-bold py-2 rounded hover:bg-gray-800"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? "Saving..." : "Submit"}
                            </button>
                            {editClub && editClub.club_id && (
                                <button
                                    type="button"
                                    className="w-48 font-bold py-2 rounded bg-red-600 text-white hover:bg-red-700"
                                    onClick={async () => {
                                        if (confirm('Are you sure you want to delete this competitor?')) {
                                            setSubmitting(true);
                                            
                                            const { data: clubData } = await supabase
                                                .from('clubs')
                                                .select('name')
                                                .eq('club_id', clubId)
                                                .single();

                                            const { error } = await supabase
                                                .from('competitors')
                                                .delete()
                                                .eq('club_id', editClub.club_id)
                                                .eq('id_number', editClub.id_number);
                                            
                                            if (!error) {
                                                const competitorFee = editClub.fee || 0;
                                                const { data: feeData } = await supabase
                                                    .from("fees")
                                                    .select("fee")
                                                    .eq("club_id", clubId)
                                                    .maybeSingle();

                                                const currentFee = feeData?.fee || 0;
                                                const newTotalFee = Math.max(currentFee - competitorFee, 0);

                                                await supabase
                                                    .from("fees")
                                                    .upsert(
                                                        [{ club_id: clubId, fee: newTotalFee }],
                                                        { onConflict: ["club_id"] }
                                                    );

                                                if (clubData) {
                                                    try {
                                                        await fetch("/api/delete/delete-competitors", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({
                                                                idNumber: editClub.id_number,
                                                                schoolClub: clubData.name,
                                                            }),
                                                        });
                                                    } catch (err) {
                                                        console.error("Failed to delete from Google Sheets", err);
                                                    }
                                                }

                                                setLoading(true);
                                                const { data } = await supabase.from('competitors').select('*').eq('club_id', clubId);
                                                setClubData(data || []);
                                                setEditClub(null);
                                                setLoading(false);
                                            } else {
                                                alert(`Delete failed! ${error.message}`);
                                            }
                                            
                                            setSubmitting(false);
                                        }
                                    }}
                                    disabled={submitting}
                                >
                                    {submitting ? "Deleting..." : "Delete"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}