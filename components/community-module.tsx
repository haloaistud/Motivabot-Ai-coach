'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, MessageCircle, ThumbsUp, Share2, TrendingUp, Award, Flame, Plus, Send, Heart, Trophy } from 'lucide-react'

interface CommunityPost {
  id: string
  author: string
  avatar: string
  content: string
  likes: number
  comments: number
  achievement?: string
  timestamp: string
}

export default function CommunityModule() {
  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: '1',
      author: 'Sarah J.',
      avatar: 'SJ',
      content: 'Just completed my 30-day streak! Feeling incredible and more motivated than ever. Remember, consistency is key!',
      likes: 24,
      comments: 8,
      achievement: '30 Day Warrior',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      author: 'Mike Chen',
      avatar: 'MC',
      content: 'Achieved my first major career goal today! MotivaBOT helped me stay focused throughout the journey. Grateful for this community!',
      likes: 45,
      comments: 12,
      achievement: 'Goal Master',
      timestamp: '5 hours ago'
    },
    {
      id: '3',
      author: 'Emma Wilson',
      avatar: 'EW',
      content: 'Daily affirmations have transformed my mindset. Starting each day with positive thoughts makes such a difference!',
      likes: 18,
      comments: 5,
      timestamp: '1 day ago'
    },
    {
      id: '4',
      author: 'David Park',
      avatar: 'DP',
      content: 'Completed 5 goals this month! The habit tracker feature keeps me accountable. Who else is crushing their goals?',
      likes: 32,
      comments: 9,
      achievement: 'Ambitious',
      timestamp: '1 day ago'
    }
  ])

  const [newPost, setNewPost] = useState('')
  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: 'Alex Rivera', streak: 45, goals: 12, avatar: 'AR' },
    { rank: 2, name: 'Jessica Lee', streak: 42, goals: 10, avatar: 'JL' },
    { rank: 3, name: 'Tom Harrison', streak: 38, goals: 11, avatar: 'TH' },
    { rank: 4, name: 'Maria Santos', streak: 35, goals: 9, avatar: 'MS' },
    { rank: 5, name: 'James Kim', streak: 33, goals: 8, avatar: 'JK' }
  ])

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ))
  }

  const handlePost = () => {
    if (!newPost.trim()) return

    const post: CommunityPost = {
      id: Date.now().toString(),
      author: 'You',
      avatar: 'YU',
      content: newPost,
      likes: 0,
      comments: 0,
      timestamp: 'Just now'
    }

    setPosts([post, ...posts])
    setNewPost('')
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Community Hub</CardTitle>
          <p className="text-white/90">Connect, share, and inspire each other</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">2,547</div>
              <p className="text-sm text-white/80">Members</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">1,892</div>
              <p className="text-sm text-white/80">Posts Today</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">98%</div>
              <p className="text-sm text-white/80">Active Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed">
            <MessageCircle className="w-4 h-4 mr-2" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="groups">
            <Users className="w-4 h-4 mr-2" />
            Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share your progress, achievements, or motivate others..."
                  className="w-full min-h-[100px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex justify-end">
                  <Button onClick={handlePost} disabled={!newPost.trim()}>
                    <Send className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {posts.map(post => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {post.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{post.author}</p>
                        <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                      </div>
                      {post.achievement && (
                        <Badge className="bg-yellow-500">
                          <Award className="w-3 h-3 mr-1" />
                          {post.achievement}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{post.content}</p>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className="hover:text-red-500"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          {leaderboard.map((user, index) => (
            <Card key={user.rank} className={index < 3 ? 'border-primary/50' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl font-bold ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-orange-600' :
                      'text-muted-foreground'
                    }`}>
                      #{user.rank}
                    </div>
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">Motivation Champion</p>
                    </div>
                  </div>
                  <div className="flex gap-6 text-center">
                    <div>
                      <div className="font-bold text-lg text-orange-500">{user.streak}</div>
                      <p className="text-xs text-muted-foreground">Streak</p>
                    </div>
                    <div>
                      <div className="font-bold text-lg text-green-500">{user.goals}</div>
                      <p className="text-xs text-muted-foreground">Goals</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommended Groups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Career Growth Warriors', members: 245, posts: 1205 },
                { name: 'Fitness & Wellness', members: 389, posts: 2341 },
                { name: 'Study Buddies', members: 156, posts: 892 },
                { name: 'Early Birds Club', members: 203, posts: 1456 }
              ].map((group, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-semibold">{group.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {group.members} members · {group.posts} posts
                    </p>
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Join
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
