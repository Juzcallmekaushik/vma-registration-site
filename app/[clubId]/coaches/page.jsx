'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Image from "next/image";
import { Pencil } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const emptyCoach = {
    full_name: "",
    date_of_birth: "",
    club_name: "",
    gender: "",
    id_number: "",
    tag_type: "",
    phone_number: ""
};

export default function ClubCoachesPage({ params }) {
    const router = useRouter();
    const { clubId } = React.use(params);
    const [coachData, setCoachData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editCoach, setEditCoach] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function fetchCoachData() {
            setLoading(true);
            const { data, error } = await supabase
                .from('coaches')
                .select('*')
                .eq('club_id', clubId);
            if (!error) setCoachData(data || []);
            setLoading(false);
        }
        fetchCoachData();
    }, []);

    const handleEdit = (coach) => {
        setEditCoach(coach);
        setEditValues(coach);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditValues((prev) => ({
            ...prev,
            [name]: value,
        }));
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

    const teamManagerCount = coachData.filter(c => c.tag_type === "Team Manager").length;
    const coachCount = coachData.filter(c => c.tag_type === "Coach").length;

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
            <h1 className="text-2xl font-bold mb-4 text-center">Coaches & Team Managers</h1>
            <table className="min-w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-black">
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Full Name</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Date of Birth</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Club Name</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Gender</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">IC/Passport Number</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Tag Type</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Phone Number</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Edit</th>
                    </tr>
                </thead>
                <tbody>
                    {coachData.map((coach) => (
                        <tr key={coach.club_id + coach.id_number}>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{coach.full_name}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{coach.date_of_birth}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{coach.club_name}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{coach.gender}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{coach.id_number}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{coach.tag_type}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{coach.phone_number}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">
                                <button
                                    type="button"
                                    title="Edit"
                                    className="cursor-pointer text-white hover:text-gray-700"
                                    onClick={() => handleEdit(coach)}
                                >
                                    <Pencil className="inline w-3 h-3" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {coachData.length === 0 && (
                        <tr>
                            <td colSpan={8} className="py-4 text-center text-gray-500 border-b border-gray-300">
                                No coaches found for this club.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="flex justify-center mt-4">
                <button
                    type="button"
                    className={`flex items-center gap-2 font-bold py-2 px-4 rounded-full shadow ${
                        (teamManagerCount >= 1 && coachCount >= 3) || coachCount >= 4
                            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                    onClick={() => {
                        setEditCoach({});
                        setEditValues(emptyCoach);
                    }}
                    aria-label="Add Coach"
                    title={
                        teamManagerCount >= 1 && coachCount >= 3
                            ? "Maximum Team Manager and Coaches reached"
                            : teamManagerCount >= 1
                            ? "Maximum Team Manager reached"
                            : coachCount >= 3
                            ? "Maximum Coaches reached"
                            : ""
                    }
                    disabled={teamManagerCount >= 1 && coachCount >= 3 || coachCount >= 4}
                >
                    <span className="text-xl leading-none">+</span>
                    <span className="hidden sm:inline text-sm">Add Coach</span>
                </button>
            </div>

            {editCoach && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="relative bg-white border border-black rounded-lg shadow-lg p-4 sm:p-6 w-[95vw] max-w-3xl flex flex-col items-center"
                        style={{ maxHeight: "95vh", minHeight: "60vh" }}>
                        <button
                            className="absolute top-2 right-2 text-black text-xl font-bold"
                            onClick={() => setEditCoach(null)}
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <h2 className="text-md sm:text-md font-bold text-black text-center w-full">
                            {editCoach && editCoach.club_id ? "Edit Coach" : "Add Coach"}
                        </h2>
                        <form
                            className="flex flex-col gap-4 w-full mt-4"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setSubmitting(true);

                                if (
                                    (!editCoach?.club_id && editValues.tag_type === "Team Manager" && teamManagerCount >= 1) ||
                                    (!editCoach?.club_id && editValues.tag_type === "Coach" && coachCount >= 3)
                                ) {
                                    alert(
                                        editValues.tag_type === "Team Manager"
                                            ? "Only 1 Team Manager allowed per team."
                                            : "Maximum 3 Coaches allowed per team."
                                    );
                                    setSubmitting(false);
                                    return;
                                }

                                if (editCoach && editCoach.club_id) {
                                    const { club_id, ...updateData } = editValues;
                                    const { error } = await supabase
                                        .from('coaches')
                                        .update(updateData)
                                        .eq('club_id', club_id)
                                        .eq('id_number', editCoach.id_number);
                                    if (!error) {
                                        const updateRes = await fetch("/api/update/update-coaches", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                oldIdNumber: editCoach.id_number,
                                                fullName: editValues.full_name,
                                                dob: editValues.date_of_birth,
                                                gender: editValues.gender,
                                                phoneNumber: editValues.phone_number,
                                                idNumber: editValues.id_number,
                                                tagType: editValues.tag_type,
                                                schoolClub: editValues.club_name,
                                            }),
                                        });

                                        if (!updateRes.ok) {
                                            console.error("Error updating coach in Google Sheets:", updateRes.statusText);
                                        }

                                        const { data } = await supabase.from('coaches').select('*').eq('club_id', clubId);
                                        setCoachData(data || []);
                                        setEditCoach(null);
                                    } else {
                                        alert('Update failed!');
                                    }
                                } else {
                                    if (!editCoach?.club_id) {
                                        const { data: existing, error: checkError } = await supabase
                                            .from('coaches')
                                            .select('id_number')
                                            .eq('club_id', clubId)
                                            .eq('id_number', editValues.id_number)
                                            .single();

                                        if (existing) {
                                            alert('A coach with this IC/Passport number already exists for this club.');
                                            setSubmitting(false);
                                            return;
                                        }
                                    }
                                    const insertData = {
                                        ...editValues,
                                        club_id: clubId,
                                    };
                                    const { error } = await supabase
                                        .from('coaches')
                                        .insert([insertData]);
                                    if (!error) {
                                        const res = await fetch("/api/add/add-coaches", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                fullName: editValues.full_name,
                                                dob: editValues.date_of_birth,
                                                gender: editValues.gender,
                                                phoneNumber: editValues.phone_number,
                                                idNumber: editValues.id_number,
                                                tagType: editValues.tag_type,
                                                schoolClub: editValues.club_name,
                                            }),
                                        });

                                        if (!res.ok) {
                                            console.error("Error saving data to Google Sheets:", res.statusText);
                                        }

                                        const { data } = await supabase.from('coaches').select('*').eq('club_id', clubId);
                                        setCoachData(data || []);
                                        setEditCoach(null);
                                    } else {
                                        alert('Insert failed!');
                                    }
                                }

                                setSubmitting(false);
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[12px] text-black font-semibold">Full Name</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={editValues.full_name || ""}
                                        onChange={handleChange}
                                        className="w-full text-black p-2 border border-black rounded bg-gray-100"
                                        required
                                    />
                                    <label className="text-[12px] text-black font-semibold">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={editValues.date_of_birth || ""}
                                        onChange={handleChange}
                                        className="w-full text-black p-2 border border-black rounded bg-gray-100"
                                        required
                                    />
                                    <label className="text-[12px] text-black font-semibold">Club Name</label>
                                    <input
                                        type="text"
                                        name="club_name"
                                        value={editValues.club_name || ""}
                                        onChange={handleChange}
                                        className="w-full text-black p-2 border border-black rounded bg-gray-100"
                                        required
                                    />
                                    <label className="text-[12px] text-black font-semibold">Gender</label>
                                    <select
                                        name="gender"
                                        value={editValues.gender || ""}
                                        onChange={handleChange}
                                        className="w-full text-black p-2 border border-black rounded bg-gray-100"
                                        required
                                    >
                                        <option value="" disabled>Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[12px] text-black font-semibold">IC/Passport Number</label>
                                    <input
                                        type="text"
                                        name="id_number"
                                        value={editValues.id_number || ""}
                                        onChange={handleChange}
                                        className="w-full text-black p-2 border border-black rounded bg-gray-100"
                                        required
                                    />
                                    <label className="text-[12px] text-black font-semibold">Tag Type</label>
                                    <select
                                        name="tag_type"
                                        value={editValues.tag_type || ""}
                                        onChange={handleChange}
                                        className={`w-full text-black p-2 border border-black rounded bg-gray-100 ${
                                            editCoach && editCoach.club_id ? "bg-gray-200 text-gray-400 cursor-not-allowed" : ""
                                        }`}
                                        required
                                        disabled={editCoach && editCoach.club_id}
                                    >
                                        <option value="" disabled>Select type</option>
                                        <option value="Team Manager" disabled={teamManagerCount >= 1 && (!editCoach?.club_id || editCoach.tag_type !== "Team Manager")}>
                                            Team Manager
                                        </option>
                                        <option value="Coach" disabled={coachCount >= 4 && (!editCoach?.club_id || editCoach.tag_type !== "Coach")}>
                                            Coach
                                        </option>
                                    </select>
                                    <label className="text-[12px] text-black font-semibold">Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone_number"
                                        value={editValues.phone_number || ""}
                                        onChange={handleChange}
                                        className="w-full text-black p-2 border border-black rounded bg-gray-100"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="w-full flex justify-center gap-4 mt-4">
                                <button
                                    type="submit"
                                    className={`w-48 font-bold py-2 rounded ${
                                        submitting
                                            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                            : "bg-black text-white hover:bg-gray-800"
                                    }`}
                                    disabled={submitting}
                                >
                                    {submitting ? "Saving..." : "Submit"}
                                </button>
                                {editCoach && editCoach.club_id && (
                                    <button
                                        type="button"
                                        className="w-48 font-bold py-2 rounded bg-red-600 text-white hover:bg-red-700"
                                        onClick={async () => {
                                            if (confirm('Are you sure you want to delete this coach?')) {
                                                setSubmitting(true);
                                                
                                                const { error } = await supabase
                                                    .from('coaches')
                                                    .delete()
                                                    .eq('club_id', editCoach.club_id)
                                                    .eq('id_number', editCoach.id_number);
                                                
                                                if (!error) {
                                                    const deleteRes = await fetch("/api/delete/delete-coaches", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({
                                                            idNumber: editCoach.id_number,
                                                            schoolClub: editCoach.club_name,
                                                        }),
                                                    });

                                                    if (!deleteRes.ok) {
                                                        console.error("Error deleting coach from Google Sheets:", deleteRes.statusText);
                                                    }

                                                    const { data } = await supabase.from('coaches').select('*').eq('club_id', clubId);
                                                    setCoachData(data || []);
                                                    setEditCoach(null);
                                                } else {
                                                    alert('Delete failed!');
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
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
