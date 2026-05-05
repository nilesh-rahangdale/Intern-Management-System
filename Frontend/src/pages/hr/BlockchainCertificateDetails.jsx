/**
 * Blockchain Certificate Details Page (HR)
 * Shows blockchain certificate and history
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    clearError,
    getCertificateBlockchainHistory,
    getCertificateFromBlockchain,
} from '../../redux/slices/certificateSlice';

const BlockchainCertificateDetails = () => {
    const { certificateId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        blockchainCertificate,
        blockchainHistory,
        loading,
        error,
    } = useSelector((state) => state.certificates);

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp.replace(' +0000 UTC', 'Z'));
        if (Number.isNaN(date.getTime())) return timestamp;
        return date.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    useEffect(() => {
        if (certificateId) {
            dispatch(getCertificateFromBlockchain(certificateId));
            dispatch(getCertificateBlockchainHistory(certificateId));
        }
    }, [dispatch, certificateId]);

    useEffect(() => () => dispatch(clearError()), [dispatch]);

    return (
        <DashboardLayout>
            <div className="p-4 md:p-6">
                <div className="mb-4">
                    <button
                        onClick={() => navigate('/hr/blockchain')}
                        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Blockchain Connect
                    </button>
                </div>

                <h1 className="text-2xl font-semibold text-gray-900 mb-4">Blockchain Certificate</h1>

                {loading ? (
                    <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-6">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                            Loading blockchain data...
                        </div>
                    </div>
                ) : error ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                ) : blockchainCertificate ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-semibold text-gray-800">Certificate Details</h2>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${blockchainCertificate.status === 'SIGNED'
                                        ? 'bg-green-100 text-green-800 border-green-300'
                                        : blockchainCertificate.status === 'GENERATED'
                                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                            : 'bg-red-100 text-red-800 border-red-300'
                                    }`}>
                                    {blockchainCertificate.status}
                                </span>
                            </div>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Certificate ID</p>
                                    <p className="font-mono text-gray-900">{blockchainCertificate.certificateId}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Intern</p>
                                    <p className="text-gray-900">{blockchainCertificate.internName}</p>
                                    <p className="text-gray-500 text-xs">{blockchainCertificate.internId}</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-gray-500">Issued By</p>
                                        <p className="text-gray-900">{blockchainCertificate.issuedBy}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Approved By</p>
                                        <p className="text-gray-900">{blockchainCertificate.approvedBy || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-500">Issue Date</p>
                                    <p className="text-gray-900">{blockchainCertificate.issueDate}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Hash</p>
                                    <p className="font-mono text-xs text-gray-900 break-all">{blockchainCertificate.hash}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Transaction ID</p>
                                    <p className="font-mono text-xs text-gray-900 break-all">{blockchainCertificate.txId}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-linear-to-br from-slate-200 to-slate-50 rounded-lg shadow-sm border border-slate-700 p-5 text-slate-500">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-semibold text-slate-600">Blockchain History</h2>
                                <span className="text-xs text-slate-600">Ledger Events</span>
                            </div>
                            {blockchainHistory.length === 0 ? (
                                <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 text-sm text-slate-300">
                                    No history records available.
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {blockchainHistory.map((entry, index) => (
                                        <div key={entry.txId} className="relative pl-6">

                                            {/* Timeline dot */}
                                            <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-blue-500 shadow-sm"></span>

                                            {/* Timeline line */}
                                            {index < blockchainHistory.length - 1 && (
                                                <span className="absolute left-1 top-5 h-full w-px bg-gray-300"></span>
                                            )}

                                            {/* Card */}
                                            <div className="rounded-xl border border-gray-200 bg-linear-to-br from-slate-50 to-slate-0 p-4 shadow-sm hover:shadow-md transition">

                                                {/* Header */}
                                                <div className="flex items-center justify-between">
                                                    <p className={`font-medium ${entry.value?.status === 'REVOKED' ? 'text-red-600' : 'text-green-600'
                                                            }`}> {entry.value?.status || 'UNKNOWN'} </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatTimestamp(entry.timestamp)}
                                                    </p>
                                                </div>

                                                {/* Info Grid */}
                                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                                    <div>
                                                        <p className="text-gray-400">Issued By</p>
                                                        <p className="text-gray-800 font-medium">
                                                            {entry.value?.issuedBy || 'N/A'}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-gray-400">Approved By</p>
                                                        <p className="text-gray-800 font-medium">
                                                            {entry.value?.approvedBy || 'N/A'}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-gray-400">Issue Date</p>
                                                        <p className="text-gray-800 font-medium">
                                                            {entry.value?.issueDate || 'N/A'}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-gray-400">Deleted</p>
                                                        <p className={`font-medium ${entry.isDelete ? 'text-red-600' : 'text-green-600'
                                                            }`}>
                                                            {entry.isDelete ? 'Yes' : 'No'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Tx ID */}
                                                <p className="mt-3 text-xs text-gray-500 break-all">
                                                    Tx: <span className="font-mono text-gray-700">{entry.txId}</span>
                                                </p>

                                                {/* Hash */}
                                                {entry.value?.hash && (
                                                    <p className="mt-1 text-[11px] text-gray-400 break-all">
                                                        Hash: <span className="font-mono">{entry.value.hash}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                        Certificate not found on blockchain.
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default BlockchainCertificateDetails;
