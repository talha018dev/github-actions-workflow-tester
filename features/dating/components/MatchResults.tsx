"use client";

import { 
  IconCheck, 
  IconHeart, 
  IconMessage, 
  IconSparkles, 
  IconTrophy,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import type { Match, UserProfile } from "../types";

interface MatchResultsProps {
  matches: Match[];
  currentUserId: string;
  getUserProfile: (userId: string) => UserProfile | null;
  onAccept: (matchId: string) => void;
  onReject: (matchId: string) => void;
  onStartChat: (matchId: string) => void;
}

export function MatchResults({ 
  matches, 
  currentUserId, 
  getUserProfile,
  onAccept,
  onReject,
  onStartChat,
}: MatchResultsProps) {
  const [actionedMatches, setActionedMatches] = useState<Set<string>>(new Set());
  
  // Get partner from match
  const getPartner = (match: Match) => {
    const partnerId = match.user1Id === currentUserId ? match.user2Id : match.user1Id;
    return getUserProfile(partnerId);
  };
  
  // Check if current user has already acted
  const getUserAction = (match: Match) => {
    return match.user1Id === currentUserId ? match.user1Action : match.user2Action;
  };
  
  const handleAccept = (matchId: string) => {
    setActionedMatches(prev => new Set([...prev, matchId]));
    onAccept(matchId);
  };
  
  const handleReject = (matchId: string) => {
    setActionedMatches(prev => new Set([...prev, matchId]));
    onReject(matchId);
  };
  
  // Separate mutual matches from pending
  const mutualMatches = matches.filter(m => m.status === 'mutual');
  const pendingMatches = matches.filter(m => m.status === 'pending');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-rose-950/20 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500/20 to-purple-500/20 text-rose-300 rounded-full text-sm font-medium mb-4">
            <IconTrophy size={16} />
            Event Complete
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">Your Matches</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Here are the connections you made tonight. Review your dates and see who you clicked with!
          </p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-1">{matches.length}</div>
            <div className="text-gray-400 text-sm">Dates</div>
          </div>
          <div className="bg-gray-900/60 backdrop-blur border border-rose-500/30 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-rose-400 mb-1">{mutualMatches.length}</div>
            <div className="text-gray-400 text-sm">Mutual Matches</div>
          </div>
          <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-1">{pendingMatches.length}</div>
            <div className="text-gray-400 text-sm">Pending</div>
          </div>
        </div>
        
        {/* Mutual matches - highlighted section */}
        {mutualMatches.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <IconSparkles size={24} className="text-rose-400" />
              It&apos;s a Match!
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {mutualMatches.map(match => {
                const partner = getPartner(match);
                if (!partner) return null;
                
                return (
                  <div 
                    key={match.id}
                    className="bg-gradient-to-br from-rose-500/10 to-purple-500/10 border border-rose-500/30 rounded-2xl p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img 
                          src={partner.avatar} 
                          alt={partner.name}
                          className="w-20 h-20 rounded-full border-2 border-rose-500"
                        />
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                          <IconHeart size={16} className="text-white fill-current" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">{partner.name}, {partner.age}</h3>
                        <p className="text-gray-400 text-sm mb-3">{partner.occupation} • {partner.location}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {partner.interests.slice(0, 3).map(interest => (
                            <span 
                              key={interest}
                              className="px-2 py-1 bg-rose-500/20 text-rose-300 rounded-full text-xs"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                        
                        {match.conversationSummary && (
                          <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
                            <div className="text-purple-400 text-xs font-semibold mb-1">AI Summary</div>
                            <p className="text-gray-300 text-sm">{match.conversationSummary}</p>
                          </div>
                        )}
                        
                        <button
                          onClick={() => onStartChat(match.id)}
                          className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                          <IconMessage size={18} />
                          Start Chatting
                        </button>
                      </div>
                    </div>
                    
                    {/* Compatibility score */}
                    <div className="mt-4 pt-4 border-t border-rose-500/20 flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Compatibility</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-rose-500 to-pink-500"
                            style={{ width: `${match.compatibilityScore}%` }}
                          />
                        </div>
                        <span className="text-rose-400 font-bold">{match.compatibilityScore}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Pending matches */}
        {pendingMatches.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <IconHeart size={24} className="text-gray-400" />
              Review Your Dates
            </h2>
            
            <div className="space-y-4">
              {pendingMatches.map(match => {
                const partner = getPartner(match);
                if (!partner) return null;
                
                const userAction = getUserAction(match);
                const hasActioned = actionedMatches.has(match.id);
                
                return (
                  <div 
                    key={match.id}
                    className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-4">
                      <img 
                        src={partner.avatar} 
                        alt={partner.name}
                        className="w-16 h-16 rounded-full border-2 border-gray-700"
                      />
                      
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{partner.name}, {partner.age}</h3>
                        <p className="text-gray-400 text-sm">{partner.occupation}</p>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {partner.interests.slice(0, 3).map(interest => (
                            <span 
                              key={interest}
                              className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full text-xs"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Compatibility */}
                      <div className="text-center mr-4">
                        <div className="text-2xl font-bold text-white">{match.compatibilityScore}%</div>
                        <div className="text-gray-500 text-xs">match</div>
                      </div>
                      
                      {/* Actions */}
                      {userAction || hasActioned ? (
                        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                          userAction === 'liked' || (hasActioned && !userAction) 
                            ? 'bg-rose-500/20 text-rose-400' 
                            : 'bg-gray-800 text-gray-400'
                        }`}>
                          {userAction === 'liked' ? 'Liked' : userAction === 'passed' ? 'Passed' : 'Processing...'}
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(match.id)}
                            className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full transition-colors"
                            title="Pass"
                          >
                            <IconX size={20} />
                          </button>
                          <button
                            onClick={() => handleAccept(match.id)}
                            className="p-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-full transition-all"
                            title="Like"
                          >
                            <IconCheck size={20} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {match.conversationSummary && (
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <div className="bg-purple-500/10 rounded-lg p-3">
                          <div className="text-purple-400 text-xs font-semibold mb-1 flex items-center gap-1">
                            <IconSparkles size={12} />
                            Conversation Highlights
                          </div>
                          <p className="text-gray-300 text-sm">{match.conversationSummary}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Empty state */}
        {matches.length === 0 && (
          <div className="text-center py-16">
            <IconHeart size={64} className="mx-auto text-gray-700 mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">No Matches Yet</h3>
            <p className="text-gray-400">Join another event to meet more amazing people!</p>
          </div>
        )}
      </div>
    </div>
  );
}

