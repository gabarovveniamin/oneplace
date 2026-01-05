import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "../../../shared/ui/components/card";
import { Button } from "../../../shared/ui/components/button";
import { Badge } from "../../../shared/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../shared/ui/components/avatar";
import { friendshipAPI, Friend, FriendRequest } from '../../../core/api/friendships';
import { authApiService, UserResponse } from '../../../core/api/auth';
import { UserPlus, UserCheck, UserMinus, Clock, Users, MessageSquare, Check, X, Search, Loader2 } from 'lucide-react';
import { Chat } from '../../../core/api/chat';

interface FriendsSectionProps {
    onChatOpen?: (chat: Chat) => void;
}

export function FriendsSection({ onChatOpen }: FriendsSectionProps) {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserResponse[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [sendRequestLoading, setSendRequestLoading] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [friendsList, incoming, outgoing] = await Promise.all([
                friendshipAPI.getFriends(),
                friendshipAPI.getIncomingRequests(),
                friendshipAPI.getOutgoingRequests()
            ]);
            setFriends(friendsList);
            setIncomingRequests(incoming);
            setOutgoingRequests(outgoing);
        } catch (error) {
            console.error('Failed to load friends data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (requestId: string) => {
        try {
            await friendshipAPI.acceptFriendRequest(requestId);
            await loadData();
        } catch (error) {
            console.error('Failed to accept friend request:', error);
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        try {
            await friendshipAPI.rejectFriendRequest(requestId);
            await loadData();
        } catch (error) {
            console.error('Failed to reject friend request:', error);
        }
    };

    const handleRemoveFriend = async (friendId: string) => {
        if (!window.confirm('Вы уверены, что хотите удалить этого пользователя из друзей?')) return;
        try {
            await friendshipAPI.removeFriend(friendId);
            await loadData();
        } catch (error) {
            console.error('Failed to remove friend:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            setIsSearching(true);
            const users = await authApiService.searchUsers(searchQuery);
            setSearchResults(users);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSendRequest = async (userId: string) => {
        try {
            setSendRequestLoading(userId);
            await friendshipAPI.sendFriendRequest(userId);
            // After sending, update outgoing requests
            const outgoing = await friendshipAPI.getOutgoingRequests();
            setOutgoingRequests(outgoing);
        } catch (error) {
            console.error('Failed to send friend request:', error);
        } finally {
            setSendRequestLoading(null);
        }
    };

    // Fetch initial recommendations when search tab is opened
    useEffect(() => {
        if (activeTab === 'search' && searchResults.length === 0) {
            loadInitialRecommendations();
        }
    }, [activeTab]);

    const loadInitialRecommendations = async () => {
        try {
            setIsSearching(true);
            const users = await authApiService.searchUsers(''); // Empty search to get initial list
            setSearchResults(users.slice(0, 15)); // Show first 15 users
        } catch (error) {
            console.error('Failed to load initial users:', error);
        } finally {
            setIsSearching(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const totalRequests = (incomingRequests?.length || 0) + (outgoingRequests?.length || 0);

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b pb-4">
                <button
                    onClick={() => setActiveTab('friends')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${activeTab === 'friends' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Users className="h-4 w-4" />
                    Мои друзья ({friends.length})
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${activeTab === 'requests' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Clock className="h-4 w-4" />
                    Заявки {totalRequests > 0 && (
                        <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700">
                            {totalRequests}
                        </Badge>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('search')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${activeTab === 'search' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Search className="h-4 w-4" />
                    Найти друзей
                </button>
            </div>

            {activeTab === 'friends' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friends.length > 0 ? (
                        friends.map((friend) => (
                            <Card key={friend.id} className="overflow-hidden card-hover">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                            <AvatarImage src={friend.avatar} alt={`${friend.first_name} ${friend.last_name}`} />
                                            <AvatarFallback>{friend.first_name[0]}{friend.last_name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate">
                                                {friend.first_name} {friend.last_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate italic">
                                                {friend.role === 'employer' ? 'Работодатель' : 'Соискатель'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            size="sm"
                                            className="grow bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={() => onChatOpen?.({
                                                other_user_id: friend.id,
                                                first_name: friend.first_name,
                                                last_name: friend.last_name,
                                                avatar: friend.avatar || null,
                                                last_message: '',
                                                last_message_at: new Date().toISOString(),
                                                is_read: true,
                                                sender_id: '',
                                                unread_count: 0
                                            })}
                                        >
                                            <MessageSquare className="h-3.5 w-3.5 mr-2" />
                                            Написать
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleRemoveFriend(friend.id)}
                                        >
                                            <UserMinus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>У вас пока нет друзей</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'requests' && (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                            Входящие заявки ({incomingRequests.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {incomingRequests.length > 0 ? (
                                incomingRequests.map((request) => (
                                    <Card key={request.request_id} className="overflow-hidden border-blue-100 bg-blue-50/10">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={request.avatar} />
                                                    <AvatarFallback>{request.first_name[0]}{request.last_name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold truncate">
                                                        {request.first_name} {request.last_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(request.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="h-8 bg-green-600 hover:bg-green-700 text-white px-3"
                                                        onClick={() => handleAcceptRequest(request.request_id)}
                                                    >
                                                        <Check className="h-4 w-4 mr-1.5" />
                                                        Принять
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 px-3"
                                                        onClick={() => handleRejectRequest(request.request_id)}
                                                    >
                                                        <X className="h-4 w-4 mr-1.5" />
                                                        Отклонить
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground py-4 italic">Нет новых входящих заявок</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                            Исходящие заявки ({outgoingRequests.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {outgoingRequests.length > 0 ? (
                                outgoingRequests.map((request) => (
                                    <Card key={request.request_id} className="overflow-hidden opacity-80">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={request.avatar} />
                                                    <AvatarFallback>{request.first_name[0]}{request.last_name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold truncate">
                                                        {request.first_name} {request.last_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground italic">Ожидание подтверждения</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 text-muted-foreground hover:text-red-500"
                                                    onClick={() => handleRejectRequest(request.request_id)}
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Отменить
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground py-4 italic">Нет активных исходящих заявок</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'search' && (
                <div className="space-y-6">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Поиск по имени или email..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95"
                        >
                            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Найти'}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {searchResults.length > 0 ? (
                            searchResults.map((user) => {
                                const isFriend = friends.some(f => f.id === user.id);
                                const isPendingIncoming = incomingRequests.some(r => r.id === user.id);
                                const isPendingOutgoing = outgoingRequests.some(r => r.id === user.id);

                                return (
                                    <Card key={user.id} className="overflow-hidden card-hover">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold truncate">
                                                        {user.firstName} {user.lastName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate italic">
                                                        {user.role === 'employer' ? 'Работодатель' : 'Соискатель'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                {isFriend ? (
                                                    <Button disabled variant="outline" className="w-full text-green-600 border-green-200 bg-green-50">
                                                        <Check className="h-4 w-4 mr-2" />
                                                        Уже в друзьях
                                                    </Button>
                                                ) : isPendingOutgoing ? (
                                                    <Button disabled variant="secondary" className="w-full text-gray-500">
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        Заявка отправлена
                                                    </Button>
                                                ) : isPendingIncoming ? (
                                                    <Button
                                                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => {
                                                            const req = incomingRequests.find(r => r.id === user.id);
                                                            if (req) handleAcceptRequest(req.request_id);
                                                        }}
                                                    >
                                                        Принять в друзья
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                                        disabled={sendRequestLoading === user.id}
                                                        onClick={() => handleSendRequest(user.id)}
                                                    >
                                                        {sendRequestLoading === user.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <UserPlus className="h-4 w-4 mr-2" />
                                                                Добавить в друзья
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : searchQuery && !isSearching ? (
                            <div className="col-span-full py-12 text-center text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>Пользователи не найдены</p>
                            </div>
                        ) : (
                            <div className="col-span-full py-12 text-center text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>Начните поиск, чтобы найти новых друзей</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
