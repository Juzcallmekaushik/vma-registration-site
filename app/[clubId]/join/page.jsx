"use client";
import React, { useState, useEffect } from "react";

export default function JoinClubPage({ params }) {
    const resolvedParams = React.use(params);
    const clubId = resolvedParams.clubId;
    const [form, setForm] = useState({
        fullName: "",
        dob: "",
        gender: "",
        idNumber: "",
        height: "",
        weight: "",
        kupDan: "",
        schoolClub: "",
        brcmember: "",
        fee: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [clubName, setClubName] = useState("");
    const [loadingClub, setLoadingClub] = useState(true);

    useEffect(() => {
        const fetchClubName = async () => {
            try {
                console.log("Fetching club data for clubId:", clubId);
                const { createClient } = await import("@supabase/supabase-js");
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                );

                const { data: clubData, error: clubError } = await supabase
                    .from("clubs")
                    .select("name")
                    .eq("club_id", clubId)
                    .maybeSingle();

                console.log("Club data received:", clubData);
                console.log("Club error:", clubError);

                if (clubError) {
                    console.error("Error fetching club:", clubError);
                    setError("Failed to load club information");
                } else if (clubData) {
                    console.log("Setting club name:", clubData.name);
                    setClubName(clubData.name);
                    setForm(prev => ({ ...prev, schoolClub: clubData.name }));
                } else {
                    console.error("No club data found for clubId:", clubId);
                    setError("Club not found");
                }
            } catch (err) {
                console.error("Error fetching club:", err);
                setError("Failed to load club information");
            } finally {
                setLoadingClub(false);
            }
        };

        if (clubId) {
            fetchClubName();
        }
    }, [clubId]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const getAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const getCategory = (age) => {
        if (age >= 4 && age <= 6) return "4-6";
        if (age >= 7 && age <= 9) return "7-9";
        if (age >= 10 && age <= 12) return "10-12";
        if (age >= 13 && age <= 15) return "13-15";
        return null;
    };

    useEffect(() => {
        if (form.dob) {
            const age = getAge(form.dob);
            if (age >= 4 && age <= 6) {
                setForm(prev => ({ ...prev, pattern: false, sparring: true }));
            } else if (age >= 7 && age <= 15) {
                setForm(prev => ({ ...prev, pattern: true, sparring: true }));
            } else {
                setForm(prev => ({ ...prev, pattern: false, sparring: false }));
            }
        }
    }, [form.dob]);

    const calculateFee = (form) => {
        let fee = 0;
        const isBrc = form.brcmember && form.brcmember.trim() !== "";
        const hasPattern = form.pattern;
        const hasSparring = form.sparring;

        if ((hasPattern && hasSparring) || hasPattern || hasSparring) {
            fee = isBrc ? 100 : 110;
        }
        return fee;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        // Validate that schoolClub is available
        if (!form.schoolClub) {
            setError("Club information is not loaded yet. Please wait and try again.");
            setSubmitting(false);
            return;
        }

        const age = getAge(form.dob);
        const category = getCategory(age);
        if (age > 15) {
            setError("Age above 15 is not allowed for this event.");
            setSubmitting(false);
            return;
        }
        if (!category) {
            setError("Age must be between 4 and 15 years old.");
            setSubmitting(false);
            return;
        }

        try {
            const { createClient } = await import("@supabase/supabase-js");
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );

            let events = "";
            if (form.pattern && form.sparring) {
                events = "pattern, sparring ";
            } else if (form.pattern) {
                events = "pattern ";
            } else if (form.sparring) {
                events = "sparring ";
            } else {
                events = "";
            }

            const fee = calculateFee(form);

            const { data: feeData, error: feeSelectError } = await supabase
                .from("fees")
                .select("fee")
                .eq("club_id", clubId)
                .maybeSingle();

            if (feeSelectError) {
                setError(`Failed to fetch current fee: ${feeSelectError.message}`);
                setSubmitting(false);
                return;
            }

            const currentFee = feeData?.fee || 0;
            const totalFee = currentFee + fee;

            const { error: feeUpdateError } = await supabase
                .from("fees")
                .upsert(
                    [{ club_id: clubId, fee: totalFee }],
                    { onConflict: ["club_id"] }
                );

            if (feeUpdateError) {
                setError(`Failed to update fee in fees table: ${feeUpdateError.message}`);
                setSubmitting(false);
                return;
            }

            // Check for duplicate ID number across all clubs
            const { data: existingById, error: selectByIdError } = await supabase
                .from("competitors")
                .select("club_id, full_name, club_name")
                .eq("id_number", form.idNumber);

            if (selectByIdError) throw selectByIdError;
            if (existingById && existingById.length > 0) {
                const existingEntry = existingById[0];
                if (existingEntry.club_id === clubId) {
                    setError("You have already registered for this club with this I/C or Passport No.");
                } else {
                    setError(`This I/C or Passport No. is already registered with ${existingEntry.club_name}. Each participant can only register once.`);
                }
                setSubmitting(false);
                return;
            }

            // Check for duplicate name and date of birth combination
            const { data: existingByName, error: selectByNameError } = await supabase
                .from("competitors")
                .select("club_id, club_name, id_number")
                .eq("full_name", form.fullName)
                .eq("date_of_birth", form.dob);

            if (selectByNameError) throw selectByNameError;
            if (existingByName && existingByName.length > 0) {
                const existingNameEntry = existingByName[0];
                if (existingNameEntry.club_id === clubId) {
                    setError("A participant with this name and date of birth is already registered for this club.");
                } else {
                    setError(`A participant with this name and date of birth is already registered with ${existingNameEntry.club_name}. Each participant can only register once.`);
                }
                setSubmitting(false);
                return;
            }

            const { error: insertError } = await supabase.from("competitors").insert([
                {
                    club_id: clubId,
                    full_name: form.fullName,
                    date_of_birth: form.dob,
                    age: age,
                    catagory: category,
                    gender: form.gender,
                    id_number: form.idNumber,
                    height: form.height,
                    weight: form.weight,
                    kup: form.kupDan,
                    events,
                    club_name: form.schoolClub,
                    brcmember: form.brcmember,
                    fee: fee,
                },
            ]);
            
            const requestBody = {
                fullName: form.fullName,
                idNumber: form.idNumber,
                gender: form.gender,
                dob: form.dob,
                age: age,
                category,
                height: form.height,
                weight: form.weight,
                kupDan: form.kupDan,
                events,
                schoolClub: form.schoolClub,
            };
            
            const res = await fetch("/api/add/add-competitors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            if (!res.ok) {
                console.error("Error saving data to Google Sheets:", res.statusText);
                setSubmitting(false);
                return;
            }

            // Also add to Age Categories sheet
            try {
                const ageCategoriesBody = {
                    fullName: form.fullName,
                    gender: form.gender,
                    idNumber: form.idNumber,
                    dob: form.dob,
                    age: age,
                    height: form.height,
                    weight: form.weight,
                    clubName: form.schoolClub
                };
                
                await fetch("/api/add/add-age-categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(ageCategoriesBody),
                });
            } catch (err) {
                console.error("Error adding to Age Categories sheet:", err);
                // Don't fail the main submission if age categories fails
            }

            if (insertError) throw insertError;
            setSubmitted(true);
        } catch (err) {
            console.error("Submission error:", err);
            setError(
                err.code === "23505"
                    ? "A duplicate entry was detected. Please check your information and try again."
                    : `Submission failed. Please try again. ${err.message}`
            );
        }
        setSubmitting(false);
    };

    // Get current age and category for display
    const currentAge = form.dob ? getAge(form.dob) : null;
    const isEventsDisabled = !form.dob || currentAge < 4 || currentAge > 15;

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black/80 text-white">
                <p className="mb-4">Thank you for joining our tournament</p>
            </div>
        );
    }

    // Show loading state while fetching club name
    if (loadingClub) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black/80 text-white">
                <p className="mb-4">Loading club information...</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen h-screen md:h-auto bg-black/70 flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="relative bg-white border border-black rounded-lg shadow-lg p-4 sm:p-6 w-[95vw] max-w-3xl flex flex-col items-center"
                style={{ maxHeight: "95vh", minHeight: "90vh" }}
            >

                <h2 className="text-md sm:text-md font-bold text-black text-center w-full">
                    VMA Junior Championship 2025 Registration
                </h2>
                <div className="flex flex-col mt-3 md:flex-row w-full gap-6">
                    <div className="flex-1 flex flex-col gap-1 order-1">
                        <label className="text-[12px] text-black font-semibold">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            placeholder="John Doe"
                            value={form.fullName}
                            onChange={handleChange}
                            required
                            className="w-full text-black p-2 border border-black rounded"
                        />
                        <label className="text-[12px] text-black font-semibold">Date of Birth</label>
                        <input
                            type="date"
                            name="dob"
                            value={form.dob}
                            onChange={handleChange}
                            required
                            className="w-full text-black p-2 border border-black rounded"
                        />
                        <label className="text-[12px] text-black font-semibold">Gender</label>
                        <div className="flex gap-4 mb-2">
                            <label className="flex items-center text-[12px] text-black gap-2">
                                <input
                                    type="checkbox"
                                    name="gender"
                                    checked={form.gender === "Male"}
                                    onChange={() =>
                                        setForm({ ...form, gender: form.gender === "Male" ? "" : "Male" })
                                    }
                                    className="accent-black"
                                />
                                Male
                            </label>
                            <label className="flex items-center text-[12px] text-black gap-2">
                                <input
                                    type="checkbox"
                                    name="gender"
                                    checked={form.gender === "Female"}
                                    onChange={() =>
                                        setForm({ ...form, gender: form.gender === "Female" ? "" : "Female" })
                                    }
                                    className="accent-black"
                                />
                                Female
                            </label>
                        </div>
                        <label className="text-[12px] text-black font-semibold">I/C or Passport No</label>
                        <input
                            type="text"
                            name="idNumber"
                            placeholder="990101-14-5679"
                            value={form.idNumber}
                            onChange={handleChange}
                            required
                            className="w-full text-black p-2 border border-black rounded"
                        />
                        <label className="text-[12px] text-black font-semibold">Height (CM)</label>
                        <input
                            type="number"
                            name="height"
                            placeholder="168 cm"
                            value={form.height}
                            onChange={handleChange}
                            required
                            className="w-full text-black p-2 border border-black rounded"
                        />
                    </div>
                    <div className="flex-1 flex flex-col gap-1 mt-6 md:mt-0 order-2 md:order-3">
                        <label className="text-[12px] text-black font-semibold">Weight (KG)</label>
                        <input
                            type="number"
                            name="weight"
                            placeholder="50 Kg"
                            value={form.weight}
                            onChange={handleChange}
                            required
                            className="w-full text-black p-2 border border-black rounded"
                        />
                        <label className="text-[12px] text-black font-semibold">Kup</label>
                        <select
                            name="kupDan"
                            value={form.kupDan}
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
                        <label className="text-[12px] text-black font-semibold">School/Club</label>
                        <input
                            type="text"
                            name="schoolClub"
                            placeholder="Visual Martial Arts"
                            value={form.schoolClub}
                            onChange={handleChange}
                            disabled={true}
                            required
                            className="w-full text-black p-2 border border-black rounded bg-gray-100 cursor-not-allowed"
                        />
                        <label className="text-[12px] text-black font-semibold">Botanic Club Membership ID (Optional)</label>
                        <input
                            type="text"
                            name="brcmember"
                            placeholder="B01234-0"
                            value={form.brcmember}
                            onChange={handleChange}
                            className="w-full text-black p-2 border border-black rounded"
                        />
                        <div className="flex flex-col gap-2 ">
                            <label className="text-[12px] text-black font-bold">
                                Events
                                {currentAge && (
                                    <span className="text-gray-600 font-normal ml-2">
                                        (Age: {currentAge} - Auto-selected based on category)
                                    </span>
                                )}
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center text-[12px] text-black gap-2">
                                    <input
                                        type="checkbox"
                                        name="pattern"
                                        checked={form.pattern || false}
                                        onChange={e => setForm({ ...form, pattern: e.target.checked })}
                                        disabled={true}
                                        className="accent-black disabled:opacity-50"
                                    />
                                    <span className="text-gray-400">Pattern</span>
                                </label>
                                <label className="flex items-center text-[12px] text-black gap-2">
                                    <input
                                        type="checkbox"
                                        name="sparring"
                                        checked={form.sparring || false}
                                        onChange={e => setForm({ ...form, sparring: e.target.checked })}
                                        disabled={true}
                                        className="accent-black disabled:opacity-50"
                                    />
                                    <span className="text-gray-400">Sparring</span>
                                </label>
                            </div>
                            {!form.dob && (
                                <p className="text-[10px] text-gray-500">Please enter date of birth to select events</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="w-full border-t border-white my-4" />
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <div className="w-full flex justify-center">
                    <button
                        type="submit"
                        className={`w-48 bg-black text-white font-bold py-2 rounded hover:bg-gray-800 ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={submitting}
                    >
                        {submitting ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </form>
        </div>
    );
}
