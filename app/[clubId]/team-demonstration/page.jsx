'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Image from "next/image";
import { Pencil } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const emptyMember = {
    name: "",
    date_of_birth: "",
    gender: "",
    kup: "",
    id_number: "",
    fee: 0,
    club_name: "",
};

export default function TeamDemoPage({ params }) {
    const router = useRouter();
    const { clubId } = React.use(params);
    const [teamData, setTeamData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMember, setEditMember] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showSelectModal, setShowSelectModal] = useState(false);
    const [clubParticipants, setClubParticipants] = useState([]);

    useEffect(() => {
        async function fetchTeamData() {
            setLoading(true);
            const { data, error } = await supabase
                .from('demo')
                .select('*')
                .eq('club_id', clubId);
            if (!error) setTeamData(data || []);
            setLoading(false);
        }
        fetchTeamData();
    }, [clubId]);

    const handleEdit = (member) => {
        setEditMember(member);
        setEditValues(member);
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
            <h1 className="text-2xl font-bold mb-4 text-center">Team Demonstration</h1>
            <table className="min-w-full border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-black">
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Name</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Date of Birth</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Gender</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Kup</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">IC/Passport Number</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Fee</th>
                        <th className="py-2 px-4 text-center text-[10px] border-b border-r border-black">Edit</th>
                    </tr>
                </thead>
                <tbody>
                    {teamData.map((member, index) => (
                        <tr key={member.club_id + member.id_number}>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{member.name}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{member.date_of_birth}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{member.gender}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{member.kup}</td>
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">{member.id_number}</td>
                            {index === 0 && (
                                <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white" rowSpan={teamData.length}>
                                    120
                                </td>
                            )}
                            <td className="py-2 px-4 text-center text-[10px] border-b border-r border-white">
                                <button
                                    type="button"
                                    title="Edit"
                                    className="cursor-pointer text-white hover:text-gray-700"
                                    onClick={() => handleEdit(member)}
                                >
                                    <Pencil className="inline w-3 h-3" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {teamData.length === 0 && (
                        <tr>
                            <td colSpan={7} className="py-4 text-center text-gray-500 border-b border-gray-300">
                                No team members found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="flex justify-center mt-4">
                <button
                    type="button"
                    className={`flex items-center gap-2 font-bold py-2 px-4 rounded-full shadow ${
                        teamData.length >= 5
                            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                    onClick={() => {
                        setEditMember({});
                        setEditValues(emptyMember);
                    }}
                    aria-label="Add Team Member"
                    title={
                        teamData.length >= 5
                            ? "Maximum 5 team members allowed"
                            : ""
                    }
                    disabled={teamData.length >= 5}
                >
                    <span className="text-xl leading-none">+</span>
                    <span className="hidden sm:inline text-sm">Add Team Member</span>
                </button>
            </div>
            <div className="flex justify-center mt-2">
                <span className="text-xs text-gray-600">Each team must contain 3 - 5 Members</span>
            </div>
x
            {editMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="relative bg-white border border-black rounded-lg shadow-lg p-4 sm:p-6 w-[95vw] max-w-3xl flex flex-col items-center"
                        style={{ maxHeight: "95vh", minHeight: "60vh" }}>
                        <button
                            className="absolute top-2 right-2 text-black text-xl font-bold"
                            onClick={() => setEditMember(null)}
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <h2 className="text-md sm:text-md font-bold text-black text-center w-full">
                            {editMember && editMember.club_id ? "Edit Team Member" : "Add Team Member"}
                        </h2>
                        <form
                            className="flex flex-col gap-4 w-full mt-4"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setSubmitting(true);

                                const { data: clubData, error: clubError } = await supabase
                                    .from('clubs')
                                    .select('name')
                                    .eq('club_id', clubId)
                                    .maybeSingle();

                                if (clubError) {
                                    alert(`Could not fetch club name. ${clubError.message}`);
                                    setSubmitting(false);
                                    return;
                                }
                                if (!clubData) {
                                    alert("Could not fetch club name. Club not found.");
                                    setSubmitting(false);
                                    return;
                                }

                                const clubName = clubData.name;

                                if (editMember && editMember.club_id) {
                                    const { club_id, ...updateData } = editValues;
                                    const { error } = await supabase
                                        .from('demo')
                                        .update(updateData)
                                        .eq('club_id', club_id)
                                        .eq('id_number', editMember.id_number);
                                    
                                    if (!error) {
                                        try {
                                            await fetch("/api/update/update-demo", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    oldIdNumber: editMember.id_number,
                                                    name: editValues.name,
                                                    dob: editValues.date_of_birth,
                                                    gender: editValues.gender,
                                                    kup: editValues.kup,
                                                    idNumber: editValues.id_number,
                                                    schoolClub: clubName,
                                                }),
                                            });
                                        } catch (err) {
                                            console.error("Failed to update Google Sheets", err);
                                        }

                                        const { data } = await supabase.from('demo').select('*').eq('club_id', clubId);
                                        setTeamData(data || []);
                                        setEditMember(null);
                                    } else {
                                        alert(`Update failed! ${error.message}`);
                                    }
                                    setSubmitting(false);
                                    return;
                                }

                                const { data: exists } = await supabase
                                    .from('demo')
                                    .select('id_number')
                                    .eq('club_id', clubId)
                                    .eq('id_number', editValues.id_number)
                                    .single();
                                if (exists) {
                                    alert('A team member with this IC/Passport number already exists.');
                                    setSubmitting(false);
                                    return;
                                }

                                const { data: competitor } = await supabase
                                    .from('competitors')
                                    .select('events, fee')
                                    .eq('club_id', clubId)
                                    .eq('id_number', editValues.id_number)
                                    .single();

                                if (!competitor) {
                                    alert('PARTICIPANT MUST BE A PART OF ATLEAST 1 INDIVIDUAL EVENT TO TAKE PART IN TEAM DEMONSTRATION.');
                                    setSubmitting(false);
                                    return;
                                }

                                const { data: existingTeamMembers } = await supabase
                                    .from('demo')
                                    .select('id_number')
                                    .eq('club_id', clubId);
                                
                                const isFirstTeamMember = !existingTeamMembers || existingTeamMembers.length === 0;
                                const teamFee = isFirstTeamMember ? 120 : 0;
                                
                                // Team demo fee is flat 120, not added to competitor fee
                                const displayFee = 120;

                                const insertData = {
                                    ...editValues,
                                    club_id: clubId,
                                    club_name: clubName,
                                };
                                
                                const { error } = await supabase
                                    .from('demo')
                                    .insert([insertData]);
                                    
                                if (!error) {
                                    const { data } = await supabase.from('demo').select('*').eq('club_id', clubId);
                                    setTeamData(data || []);
                                    setEditMember(null);

                                    if (teamFee > 0) {
                                        const { data: feeData } = await supabase
                                            .from("fees")
                                            .select("fee")
                                            .eq("club_id", clubId)
                                            .maybeSingle();

                                        const currentFee = feeData?.fee || 0;
                                        const newTotalFee = currentFee + teamFee;

                                        await supabase
                                            .from("fees")
                                            .upsert(
                                                [{ club_id: clubId, fee: newTotalFee }],
                                                { onConflict: ["club_id"] }
                                            );
                                    }

                                    try {
                                        await fetch("/api/add/add-demo", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                name: editValues.name,
                                                dob: editValues.date_of_birth,
                                                gender: editValues.gender,
                                                kup: editValues.kup,
                                                idNumber: editValues.id_number,
                                                schoolClub: clubName,
                                            }),
                                        });
                                    } catch (err) {
                                        console.error("Failed to send to /api/add-demo", err);
                                    }
                                } else {
                                    alert(`Insert failed! ${error.message}`);
                                    setSubmitting(false);
                                    return;
                                }

                                setSubmitting(false);
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[12px] text-black font-semibold">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editValues.name || ""}
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
                                    <label className="text-[12px] text-black font-semibold">Kup</label>
                                    <select
                                        name="kup"
                                        value={editValues.kup}
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
                                    <label className="text-[12px] text-black font-semibold">IC/Passport Number</label>
                                    <input
                                        type="text"
                                        name="id_number"
                                        value={editValues.id_number}
                                        onChange={handleChange}
                                        className="w-full text-black p-2 border border-black rounded bg-gray-100"
                                        required
                                        disabled={editMember && editMember.club_id}
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
                                {editMember && editMember.club_id && (
                                    <button
                                        type="button"
                                        className="w-48 font-bold py-2 rounded bg-red-600 text-white hover:bg-red-700"
                                        onClick={async () => {
                                            if (confirm('Are you sure you want to delete this team member?')) {
                                                setSubmitting(true);

                                                // Check if this is the last team member
                                                const { data: allTeamMembers } = await supabase
                                                    .from('demo')
                                                    .select('id_number')
                                                    .eq('club_id', clubId);
                                                
                                                const isLastTeamMember = allTeamMembers && allTeamMembers.length === 1;
                                                const teamFee = isLastTeamMember ? 120 : 0;

                                                const { data: competitor } = await supabase
                                                    .from('competitors')
                                                    .select('events, fee')
                                                    .eq('club_id', clubId)
                                                    .eq('id_number', editMember.id_number)
                                                    .single();

                                                const { error } = await supabase
                                                    .from('demo')
                                                    .delete()
                                                    .eq('club_id', editMember.club_id)
                                                    .eq('id_number', editMember.id_number);

                                                if (!error) {
                                                    const { data: clubData } = await supabase
                                                        .from('clubs')
                                                        .select('name')
                                                        .eq('club_id', clubId)
                                                        .single();

                                                    if (clubData) {
                                                        try {
                                                            await fetch("/api/delete/delete-demo", {
                                                                method: "POST",
                                                                headers: { "Content-Type": "application/json" },
                                                                body: JSON.stringify({
                                                                    idNumber: editMember.id_number,
                                                                    schoolClub: clubData.name,
                                                                }),
                                                            });
                                                        } catch (err) {
                                                            console.error("Failed to delete from Google Sheets", err);
                                                        }
                                                    }

                                                    // Only update fees if this is the last team member (teamFee > 0)
                                                    if (teamFee > 0) {
                                                        const { data: feeData } = await supabase
                                                            .from("fees")
                                                            .select("fee")
                                                            .eq("club_id", clubId)
                                                            .maybeSingle();

                                                        const currentFee = feeData?.fee || 0;
                                                        const newTotalFee = Math.max(currentFee - teamFee, 0);

                                                        await supabase
                                                            .from("fees")
                                                            .upsert(
                                                                [{ club_id: clubId, fee: newTotalFee }],
                                                                { onConflict: ["club_id"] }
                                                            );
                                                    }

                                                    if (competitor) {
                                                        let newEvents = competitor.events || "";
                                                        newEvents = newEvents
                                                            .replace(/\s*&\s*Team Demonstration/g, "")
                                                            .replace(/Team Demonstration\s*&\s*/g, "")
                                                            .replace(/^Team Demonstration$/g, "")
                                                            .trim();
                                                        
                                                        // Don't change competitor fee, just update events
                                                        await supabase
                                                            .from('competitors')
                                                            .update({
                                                                events: newEvents,
                                                            })
                                                            .eq('club_id', clubId)
                                                            .eq('id_number', editMember.id_number);
                                                    }

                                                    const { data } = await supabase.from('demo').select('*').eq('club_id', clubId);
                                                    setTeamData(data || []);
                                                    setEditMember(null);
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
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
