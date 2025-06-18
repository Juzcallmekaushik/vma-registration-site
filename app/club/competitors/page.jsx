'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from "next/image";
import { Pencil } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ClubCompetitorsPage() {
    const [clubData, setClubData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editClub, setEditClub] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function fetchClubData() {
            setLoading(true);
            const { data, error } = await supabase
                .from('club_data')
                .select('*');
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
        const { club_id, ...updateData } = editValues;
        const { error } = await supabase
            .from('club_data')
            .update(updateData)
            .eq('club_id', club_id);
        setSubmitting(false);
        if (!error) {
            setLoading(true);
            const { data } = await supabase.from('club_data').select('*');
            setClubData(data || []);
            setEditClub(null);
        } else {
            alert('Update failed!');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <Image
                    src="/logos/vmalogo.png"
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
            <h1 className="text-2xl font-bold mb-4 text-center">Club Competitors</h1>
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
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">State</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Events</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-black">Edit</th>
                    </tr>
                </thead>
                <tbody>
                    {clubData.map((club) => (
                        <tr key={club.club_id}>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.full_name}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.date_of_birth}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.catagory}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.gender}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.id_number}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.height}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.weight}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.kup}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.state}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{club.events}</td>
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
                            <td colSpan={13} className="py-4 text-center text-gray-500 border-b border-gray-300">
                                No club data found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Modal */}
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
                        <div className="flex flex-col mt-3 md:flex-row w-full gap-6 overflow-y-auto">
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
                                <label className="text-[12px] text-black font-semibold">Height (CM)</label>
                                <input
                                    type="number"
                                    name="height"
                                    value={editValues.height || ""}
                                    onChange={handleChange}
                                    className="w-full text-black p-2 border border-black rounded bg-gray-100"
                                />
                            </div>
                            <div className="hidden md:block w-px bg-black md:order-2" />
                            <div className="flex-1 flex flex-col gap-1 mt-6 md:mt-0 order-2 md:order-3">
                                <label className="text-[12px] text-black font-semibold">Weight (KG)</label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={editValues.weight || ""}
                                    onChange={handleChange}
                                    className="w-full text-black p-2 border border-black rounded bg-gray-100"
                                />
                                <label className="text-[12px] text-black font-semibold">Kup / Dan</label>
                                <input
                                    type="text"
                                    name="kup_dan"
                                    value={editValues.kup_dan || ""}
                                    onChange={handleChange}
                                    className="w-full text-black p-2 border border-black rounded bg-gray-100"
                                />
                                <label className="text-[12px] text-black font-semibold">State / Country</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={editValues.state || ""}
                                    onChange={handleChange}
                                    className="w-full text-black p-2 border border-black rounded bg-gray-100"
                                />
                                <div className="flex flex-col gap-2 ">
                                    <label className="text-[12px] text-black font-bold">Events</label>
                                    <input
                                        type="text"
                                        name="events"
                                        value={editValues.events || ""}
                                        onChange={handleChange}
                                        className="w-full text-black p-2 border border-black rounded bg-gray-100"
                                    />
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}