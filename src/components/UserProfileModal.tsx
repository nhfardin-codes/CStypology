import React, { useEffect, useState } from 'react';
import { X, LogIn, LogOut, History, ShieldCheck, Trophy, Sparkles } from 'lucide-react';
import { User } from 'firebase/auth';
import {
  signInWithGoogle,
  logOut,
  fetchUserProfile,
  fetchUserRecords,
  UserStatsProfile,
  SavedTypingRecord,
} from '../services/firebase';
import {
  loadAllTimeMilestones,
  loadLocalHistory,
  AllTimeMilestones,
  LocalTypingRecord,
} from '../services/storage';

interface UserProfileModalProps {
  user: User | null;
  onClose: () => void;
  onUserChange?: (u: User | null) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onClose,
  onUserChange,
}) => {
  const [profile, setProfile] = useState<UserStatsProfile | null>(null);
  const [localMilestones, setLocalMilestones] = useState<AllTimeMilestones>(loadAllTimeMilestones);
  const [records, setRecords] = useState<(SavedTypingRecord | LocalTypingRecord)[]>([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchUserProfile(user.uid), fetchUserRecords(user.uid)])
        .then(([p, recs]) => {
          setProfile(p);
          if (recs && recs.length > 0) {
            setRecords(recs);
          } else {
            setRecords(loadLocalHistory(25));
          }
        })
        .finally(() => setLoading(false));
    } else {
      const local = loadAllTimeMilestones();
      setLocalMilestones(local);
      setRecords(loadLocalHistory(25));
      setProfile(null);
    }
  }, [user]);

  const handleSignIn = async () => {
    try {
      setAuthError(null);
      setLoading(true);
      const loggedUser = await signInWithGoogle();
      if (onUserChange) onUserChange(loggedUser);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed';
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      if (onUserChange) onUserChange(null);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  // Resolve best and average metrics
  const displayBestWpm = Math.max(profile?.bestWpm || 0, localMilestones.bestWpm || 0);
  const displayAvgWpm = profile?.averageWpm || localMilestones.averageWpm || 0;
  const displayAvgAcc = profile?.averageAccuracy || localMilestones.averageAccuracy || 100;
  const displayTotalTests = Math.max(profile?.totalTestsCompleted || 0, localMilestones.totalTestsCompleted || 0);
  const displayTotalWords = (profile?.totalWordsTyped || 0) || (localMilestones.totalWordsTyped || 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Minimal Header */}
        <div className="flex items-center justify-between p-4 px-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">All-Time Milestones & WPM History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Account Status Strip */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs">
            {user ? (
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    className="w-8 h-8 rounded-full border border-cyan-400 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-xs">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <h3 className="text-xs font-bold text-white">{user.displayName || 'Typist'}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <span>Guest typist · Milestones saved locally</span>
              </div>
            )}

            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in with Google</span>
              </button>
            )}
          </div>

          {/* All-Time Milestones Grid */}
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Career Statistics
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Personal Best</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black font-mono text-cyan-400">
                    {displayBestWpm}
                  </span>
                  <span className="text-xs font-mono text-slate-500">WPM</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Average Speed</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    {displayAvgWpm}
                  </span>
                  <span className="text-xs font-mono text-slate-500">WPM</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Avg Accuracy</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black font-mono text-slate-200">
                    {displayAvgAcc}%
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Tests Finished</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black font-mono text-slate-200">
                    {displayTotalTests}
                  </span>
                  {displayTotalWords > 0 && (
                    <span className="text-[10px] font-mono text-slate-500">
                      ({displayTotalWords}w)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Saved WPM Session Records */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>Saved WPM History ({records.length})</span>
              </span>
            </div>

            {records.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500">
                No typing tests saved yet. Complete any drill to record your WPM!
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40 max-h-56">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-medium border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="p-2 pl-3">Session</th>
                      <th className="p-2 font-mono">Net WPM</th>
                      <th className="p-2 font-mono">Accuracy</th>
                      <th className="p-2 font-mono">Time</th>
                      <th className="p-2 pr-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                    {records.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-2 pl-3 font-sans text-slate-200 font-medium truncate max-w-[160px]">
                          {rec.lessonTitle}
                        </td>
                        <td className="p-2 text-cyan-400 font-bold">{rec.netWpm}</td>
                        <td className="p-2 text-emerald-400">{rec.accuracy}%</td>
                        <td className="p-2 text-slate-400">{rec.elapsedSeconds}s</td>
                        <td className="p-2 pr-3 text-right text-slate-500 text-[11px]">
                          {new Date(rec.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="p-3 px-5 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
