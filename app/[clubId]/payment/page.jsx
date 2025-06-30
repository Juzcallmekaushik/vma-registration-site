'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PaymentPage() {
    const { clubId } = useParams();
    const router = useRouter();
    const [fee, setFee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clubName, setClubName] = useState('');
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [
                    { data: feeData, error: feeError }, 
                    { data: clubData, error: clubError },
                    { data: paymentData, error: paymentError }
                ] = await Promise.all([
                    supabase.from('fees').select('fee').eq('club_id', clubId).single(),
                    supabase.from('clubs').select('name').eq('club_id', clubId).single(),
                    supabase.from('payment').select('status').eq('club_id', clubId).single()
                ]);
                
                setFee(feeError || !feeData ? '0' : feeData.fee);
                setClubName(clubError || !clubData ? 'Unknown Club' : clubData.name);
                setPaymentStatus(paymentError || !paymentData ? null : paymentData.status);
            } catch (error) {
                console.error('Fetch error:', error);
                setFee('0');
                setClubName('Unknown Club');
                setPaymentStatus(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [clubId]);

    const handleConfirm = async () => {
        try {
            await supabase.from('payment').insert([
                {
                    club_id: clubId,
                    club_name: clubName,
                    fee,
                    status: 'pending'
                }
            ]);
            setPaymentStatus('pending');
        } catch (error) {
            console.error('Error confirming payment:', error);
            alert('Failed to confirm payment. Please try again.');
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

    return (
        <>
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

            <main style={{
                maxWidth: 400,
                margin: '5rem auto',
                padding: 24,
                border: '1px solid #e0e0e0',
                borderRadius: 10,
                background: '#000000'
            }}>
            <section style={{ margin: '20px 0', textAlign: 'center' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>TOTAL FEE</h2>
                <div style={{ fontSize: 48, color: '#1976d2', fontWeight: 1000 }}>
                    {loading ? 'Loading...' : fee !== null ? `RM ${fee}.00` : '0.00'}
                </div>
            </section>
            <section style={{ marginBottom: 10, textAlign: 'center', fontSize: 16 }}>
                <strong>VISUAL MARTIAL ARTS</strong><br />
                Bank: PUBLIC BANK<br />
                Account No: 3198279311
            </section>
            <section style={{ marginBottom: 24, textAlign: 'center', fontSize: 15 }}>
                Please send the payment receipt to:<br />
                <strong>+60 16-212 5302</strong> or <strong>+60 14-946 6223</strong>
            </section>
            <section style={{ textAlign: 'center' }}>
                {paymentStatus === null ? (
                    <button
                        onClick={handleConfirm}
                        style={{
                            padding: '10px 20px',
                            background: '#1976d2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 5,
                            cursor: 'pointer',
                            fontSize: 11,
                            fontWeight: 700,
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
                        }}
                    >
                        Confirm Payment
                    </button>
                ) : paymentStatus === 'pending' ? (
                    <span style={{ color: '#ff9800', fontWeight: 600, fontSize: 17 }}>Pending</span>
                ) : paymentStatus === 'completed' ? (
                    <span style={{ color: '#4caf50', fontWeight: 600, fontSize: 17 }}>Completed</span>
                ) : null}
            </section>
        </main>
        </>
    );
}