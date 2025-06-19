"use client";
import { useSession, signOut } from "next-auth/react";
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
                    src="/logos/VMALogo.png"
                    alt="Loading"
                    width={80}
                    height={80}
                    className="animate-pulse"
                />
            </div>
        );
    }

    const baseUrl =
        typeof window !== "undefined" && window.location.hostname === "localhost"
            ? "http://localhost:3000"
            : "https://www.visualmartialarts.live";

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.replace("/register");
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white">
            <nav className="w-full bg-[#080808] px-4 py-2 flex items-center justify-between border-b border-gray-800" style={{ height: "40px" }}>
                <div className="flex items-center gap-6">
                    <span className="font-extrabold text-lg">Club Panel</span>
                    <a
                        href={`/${club?.club_id?.toLowerCase()}/competitors`}
                        className="text-xs font-semibold text-white hover:text-gray-400"
                    >
                        Competitor
                    </a>
                    <a
                        href={`/${club?.club_id?.toLowerCase()}/representatives`}
                        className="text-xs font-semibold text-white hover:text-gray-400"
                    >
                        Representatives
                    </a>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-200">{club?.name}</span>
                    <button
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs font-bold"
                        onClick={handleSignOut}
                    >
                        Sign Out
                    </button>
                </div>
            </nav>
            <div className="flex flex-col mt-5 md:flex-row justify-between items-center mb-4 gap-2">
                <div className="bg-white text-black rounded ml-5 px-3 py-2 font-semibold text-[12px] shadow">
                    Club ID: {club?.club_id}
                </div>
                <div className="bg-white mr-5 text-black rounded px-3 py-2 font-semibold text-[12px] shadow">
                    Competitor Invite Link: <a
                        href={`${baseUrl}/${club?.club_id?.toLowerCase()}/join`}
                        className="hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {baseUrl}/{club?.club_id?.toLowerCase()}/join
                    </a>
                </div>
            </div>
            <div className="bg-white mr-5 ml-5 rounded-lg p-4 flex flex-col md:flex-row gap-4">
                <a
                    href={`/${club?.club_id?.toLowerCase()}/details`}
                    className="flex-1 bg-gray-200 rounded-lg flex items-center justify-center min-h-[120px] font-bold text-sm text-black text-center hover:bg-gray-300 transition"
                >
                    CLUB DETAILS
                </a>
                <a
                    href={`/${club?.club_id?.toLowerCase()}/competitors`}
                    className="flex-1 bg-gray-200 rounded-lg flex items-center justify-center min-h-[120px] font-bold text-sm text-black text-center hover:bg-gray-300 transition"
                >
                    COMPETITORS
                </a>
                <a
                    href={`/${club?.club_id?.toLowerCase()}/coaches`}
                    className="flex-1 bg-gray-200 rounded-lg flex items-center justify-center min-h-[120px] font-bold text-sm text-black text-center hover:bg-gray-300 transition"
                >
                    COACHES
                </a>
                <a
                    href={`/${club?.club_id?.toLowerCase()}/payment`}
                    className="flex-1 bg-gray-200 rounded-lg flex items-center justify-center min-h-[120px] font-bold text-sm text-black text-center hover:bg-gray-300 transition"
                >
                    <div>
                        PAYMENT<br />INFORMATION
                    </div>
                </a>
            </div>
            <div className="bg-white mr-5 ml-5 mt-6 rounded-lg p-4 shadow flex flex-col text-black text-[10px] font-medium">
                <div className="text-left text-sm font-bold mb-2">Tournament Information</div>
                <div><span className="font-bold">Date:</span> 13/09/2025 (Saturday)</div>
                <div>
                    <span className="font-bold">Venue:</span> Botanic Resort Club (Klang) - 1, Jalan Ambang Botanic, Bandar Botanic, 41200, Selangor
                </div>
                <div><span className="font-bold">Gender:</span> Male & Female</div>
                <div><span className="font-bold">Age Group:</span> 4 Years old to 16 Years old Only</div>
                <div><span className="font-bold">Events:</span> Individual Pattern & Sparring Only</div>
                <div><span className="font-bold">Fee:</span> -</div>
                <div><span className="font-bold">Kup:</span> Kup 10th to Kup 1st (Colour Belt Only)</div>
                <div><span className="font-bold">Deadline:</span> -</div>
                <div>
                    <span className="font-bold">Contact:</span>
                    <a
                        href="https://api.whatsapp.com/send/?phone=%2B60162125302&text&type=phone_number&app_absent=0"
                        className="hover:text-green-700 ml-1"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        +60 16-212 5302
                    </a>
                    ,&nbsp;
                    <a
                        href="https://api.whatsapp.com/send/?phone=%2B60192244846&text&type=phone_number"
                        className="hover:text-green-700"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        +60 19-224 4846
                    </a>
                    &nbsp;or&nbsp;
                    <a href="mailto:visualmartialarts@gmail.com" className="hover:text-green-700">visualmartialarts@gmail.com</a>
                </div>
            </div>
        </div>
    );
}
