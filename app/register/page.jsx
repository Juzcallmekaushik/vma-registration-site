"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        dob: "",
        phone: "",
        email: "",
        club: "",
        clubEmail: "",
        masterName: "",
        address: "",
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            if (status === "loading") return;
            if (!session) {
                setShowForm(false);
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from("clubs")
                .select("*")
                .eq("user_email", session.user.email)
                .single();

            if (data) {
                setShowForm(false);
                router.replace(`/club/`);
            } else {
                setShowForm(true);
            }
            setLoading(false);
        };
        checkUser();
    }, [session, status, router]);

    useEffect(() => {
        if (session) {
            setForm((prev) => ({
                ...prev,
                email: session.user.email || "",
            }));
        }
    }, [session]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const generateClubId = async () => {
        let clubId;
        let exists = true;
        while (exists) {
            const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
            const timePart = Date.now().toString(36).toUpperCase().slice(-4);
            clubId = randomPart + timePart;
            const { data } = await supabase
                .from("clubs")
                .select("club_id")
                .eq("club_id", clubId)
                .single();
            exists = !!data;
        }
        return clubId;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
            const { data: existingClub, error: checkError } = await supabase
                .from("clubs")
                .select("user_email")
                .eq("name", form.club)
                .single();

            if (existingClub) {
                alert(`Club has already registered. Please use the email: ${existingClub.user_email} to login.`);
                setSubmitting(false);
                return;
            }

            const { data: existingEmail } = await supabase
                .from("clubs")
                .select("id")
                .eq("user_email", form.email)
                .single();

            if (existingEmail) {
                alert("A club with this user email is already registered.");
                setSubmitting(false);
                return;
            }

            const clubId = await generateClubId();
            const clubData = {
                club_id: clubId.toLowerCase(),
                name: form.club,
                email: form.clubEmail,
                phone_number: form.phone,
                master_name: form.masterName,
                representative: `${form.firstName} ${form.lastName}`,
                address: form.address,
                user_email: form.email,
            };
            const { error } = await supabase.from("clubs").insert([clubData]);
            if (!error) {
                await fetch('/api/create-sheet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clubName: form.club }),
                });
                router.replace(`/club`);
            } else {
                console.error("Error registering club:", error, clubData);
                alert("Registration failed. Please try again.\n" + error.message);
            }
        } finally {
            setSubmitting(false);
        }
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

    if (showForm) {
        return (
            <div className="relative min-h-screen bg-black/70 flex items-center justify-center px-2 sm:px-4">
            <button
                type="button"
                onClick={() => setShowForm(false)}
                className="absolute sm:absolute top-2 left-2 z-30 text-sm items-center text-white p-2 shadow-lg sm:flex hidden"
                aria-label="Back"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                <span className="hidden sm:inline ml-1">Back</span>
            </button>
            <form
                onSubmit={handleSubmit}
                className="relative bg-white border border-black rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-lg md:max-w-2xl lg:max-w-3xl flex flex-col items-center"
                style={{ maxHeight: "90vh", minHeight: "50vh" }}
            >
                <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex sm:hidden absolute top-2 left-2 z-30 text-sm items-center text-black p-2"
                aria-label="Back"
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                </button>
                <div className="flex flex-col md:flex-row w-full gap-6 md:gap-8 overflow-y-auto">
                <div className="flex-1 flex flex-col gap-2 order-1">
                    <h2 className="text-lg md:text-xl font-extrabold text-black text-center md:text-left">User Details</h2>
                    <label className="text-xs md:text-sm text-black font-semibold">First Name</label>
                    <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={form.firstName || ""}
                    onChange={handleChange}
                    required
                    className="w-full text-black p-2 border border-black rounded"
                    />
                    <label className="text-xs md:text-sm text-black font-semibold">Last Name</label>
                    <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={form.lastName || ""}
                    onChange={handleChange}
                    required
                    className="w-full text-black p-2 border border-black rounded"
                    />
                    <label className="text-xs md:text-sm text-black font-semibold">Date of Birth</label>
                    <input
                    type="date"
                    name="dob"
                    value={form.dob || ""}
                    onChange={handleChange}
                    required
                    className="w-full text-black p-2 border border-black rounded"
                    />
                    <label className="text-xs md:text-sm text-black font-semibold">Phone Number</label>
                    <input
                    type="tel"
                    name="phone"
                    placeholder="+60 12-345 6789"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full text-black p-2 border border-black rounded"
                    />
                    <label className="text-xs md:text-sm text-black font-semibold">Email Address</label>
                    <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full text-black p-2 border border-black rounded"
                    disabled
                    />
                </div>
                <div className="flex-1 flex flex-col gap-2 order-2 md:order-3">
                    <h2 className="text-lg md:text-xl font-extrabold text-black text-center md:text-left">Club Details</h2>
                    <label className="text-xs md:text-sm text-black font-semibold">Club Name</label>
                    <input
                    type="text"
                    name="club"
                    placeholder="Club Name"
                    value={form.club}
                    onChange={handleChange}
                    required
                    className="w-full text-black p-2 border border-black rounded"
                    pattern=".{2,}"
                    title="Club name must be at least 2 characters"
                    />
                    <label className="text-xs md:text-sm text-black font-semibold">Club Email</label>
                    <input
                    type="email"
                    name="clubEmail"
                    placeholder="Club Email"
                    value={form.clubEmail || ""}
                    onChange={handleChange}
                    required
                    className="w-full text-black p-2 border border-black rounded"
                    />
                    <label className="text-xs md:text-sm text-black font-semibold">Master Full Name</label>
                    <input
                    type="text"
                    name="masterName"
                    placeholder="Master Full Name"
                    value={form.masterName || ""}
                    onChange={handleChange}
                    required
                    className="w-full text-black p-2 border border-black rounded"
                    />
                    <label className="text-xs md:text-sm text-black font-semibold">Address</label>
                    <textarea
                    name="address"
                    placeholder="Address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    rows={2}
                    className="w-full text-black p-2 border border-black rounded resize-none md:h-auto"
                    style={{ minHeight: "60px", maxHeight: "100px" }}
                    />
                </div>
                </div>
                <div className="w-full border-t border-gray-200 my-4" />
                <div className="w-full flex justify-center">
                <button
                    type="submit"
                    className={`w-full sm:w-48 bg-black text-white font-bold py-2 rounded hover:bg-gray-800 ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={submitting}
                >
                    {submitting ? "Submitting..." : "Submit"}
                </button>
                </div>
            </form>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-30"
            >
                <source src="/videos/SPV.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen bg-black/40">
                <p className="text-md sm:text-lg font-bold text-white drop-shadow-lg text-center">
                    VISUAL MARTIAL ARTS
                </p>
                <h1 className="text-2xl sm:text-6xl mt-0 font-black text-white mb-4 drop-shadow-lg text-center">
                    JUNIOR CHAMPIONSHIP 2025
                </h1>
                <button
                    className="px-4 py-3 border border-white text-white font-bold rounded-lg shadow-lg transition bg-transparent cursor-pointer hover:bg-white hover:text-black active:bg-white active:text-black sm:active:bg-transparent sm:active:text-white"
                    onClick={() => signIn("google")}
                >
                    REGISTER CLUB
                </button>
            </div>
            <div className="fixed top-3 left-3 flex flex-row items-end gap-2 z-20">
                <Image
                    src="/logos/BotanicLogo.png"
                    alt="Botanic Resort Club Logo"
                    width={50}
                    height={50}
                    className="rounded-full shadow-lg p-1"
                />
                <Image
                    src="/logos/VMALogo.png"
                    alt="Visual Martial Arts Logo"
                    width={50}
                    height={50}
                    className="rounded-full shadow-lg p-1"
                />
            </div>
        </div>
    );
}
