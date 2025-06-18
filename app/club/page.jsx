"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ClubHomePage() {
    const { data: session, status } = useSession();
    const loading = status === "loading";
    const email = session?.user?.email;

    const [club, setClub] = useState(null);
    const [competitors, setCompetitors] = useState([]);
    const [representatives, setRepresentatives] = useState([]);
    const [fetching, setFetching] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (loading || !email) return;
        const fetchClubData = async () => {
            setFetching(true);
            const { data: clubData } = await supabase
                .from("clubs")
                .select("*")
                .eq("user_email", email)
                .single();
            if (!clubData) {
                router.replace("/register");
                return;
            }
            setClub(clubData);

            const { data: competitorsData } = await supabase
                .from("competitors")
                .select("*")
                .eq("club_id", clubData.club_id);

            setCompetitors(competitorsData || []);

            const { data: repsData } = await supabase
                .from("representatives")
                .select("*")
                .eq("club_id", clubData.club_id);

            setRepresentatives(repsData || []);
            setFetching(false);
        };
        fetchClubData();
    }, [loading, email, router]);

    if (loading || fetching) {
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
        <div className="min-h-screen bg-[#181a1b] text-white">
            <nav className="w-full bg-[#101623] px-4 py-2 flex items-center justify-between" style={{ height: "40px" }}>
                <div className="flex items-center gap-6">
                    <span className="font-extrabold text-lg">Club Panel</span>
                    <a
                        href="/club/competitors"
                        className="text-xs font-semibold text-gray-200 hover:underline"
                    >
                        Competitor
                    </a>
                    <a
                        href="/club/representatives"
                        className="text-xs font-semibold text-gray-200 hover:underline"
                    >
                        Representatives
                    </a>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-200">{club?.name}</span>
                    <button
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs font-bold"
                        onClick={() => router.push("/api/auth/signout")}
                    >
                        Sign Out
                    </button>
                </div>
            </nav>
            <div className="flex flex-col items-center justify-center py-10">
                <div className="bg-[#181a1b] w-full max-w-2xl rounded-lg shadow-lg border border-[#23272b] p-6">
                    <h1 className="text-2xl font-bold mb-6 text-white">{club?.name} Home</h1>
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-2 text-gray-100">Competitors</h2>
                        {competitors.length === 0 ? (
                            <p className="text-gray-400">No competitors registered yet.</p>
                        ) : (
                            <ul className="list-disc list-inside text-gray-200">
                                {competitors.map((c) => (
                                    <li key={c.id}>{c.name}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold mb-2 text-gray-100">Representatives</h2>
                        {representatives.length === 0 ? (
                            <p className="text-gray-400">No representatives added yet.</p>
                        ) : (
                            <ul className="list-disc list-inside text-gray-200">
                                {representatives.map((r) => (
                                    <li key={r.id}>{r.name}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}