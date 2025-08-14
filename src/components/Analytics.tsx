import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const downloadsData = [
  { day: 'Mon', downloads: 45, users: 23 },
  { day: 'Tue', downloads: 52, users: 28 },
  { day: 'Wed', downloads: 38, users: 19 },
  { day: 'Thu', downloads: 61, users: 35 },
  { day: 'Fri', downloads: 48, users: 25 },
  { day: 'Sat', downloads: 32, users: 18 },
  { day: 'Sun', downloads: 25, users: 15 },
];

const popularFilesData = [
  { name: 'Math Papers', downloads: 245, color: '#00bcd4' },
  { name: 'Physics Videos', downloads: 189, color: '#4caf50' },
  { name: 'Chemistry Notes', downloads: 156, color: '#ff9800' },
  { name: 'Biology Guides', downloads: 134, color: '#e91e63' },
  { name: 'Programming', downloads: 98, color: '#9c27b0' },
];

const creditsData = [
  { month: 'Jan', purchased: 450, earned: 280 },
  { month: 'Feb', purchased: 520, earned: 320 },
  { month: 'Mar', purchased: 480, earned: 290 },
  { month: 'Apr', purchased: 580, earned: 350 },
  { month: 'May', purchased: 620, earned: 380 },
  { month: 'Jun', purchased: 680, earned: 420 },
];

export const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Total Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">1,245</div>
            <p className="text-sm text-muted-foreground">+18% from last week</p>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">342</div>
            <p className="text-sm text-muted-foreground">+12% new users this month</p>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Credits Purchased</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">$2,840</div>
            <p className="text-sm text-muted-foreground">+25% revenue growth</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Daily Downloads & Users</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={downloadsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Line type="monotone" dataKey="downloads" stroke="#00bcd4" strokeWidth={3} />
                <Line type="monotone" dataKey="users" stroke="#4caf50" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Most Downloaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={popularFilesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="downloads"
                >
                  {popularFilesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Credits: Purchased vs Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={creditsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="purchased" fill="#00bcd4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="earned" fill="#4caf50" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <h4 className="font-semibold text-green-400 mb-2">📈 Positive Trends</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Attendance rate improved by 2.1%</li>
                <li>• Average check-in time is 12 min earlier</li>
                <li>• Overtime hours reduced by 8%</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <h4 className="font-semibold text-yellow-400 mb-2">⚠️ Areas to Watch</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Wednesday shows highest absence rate</li>
                <li>• Engineering dept needs better time management</li>
                <li>• Late arrivals increased on Monday</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <h4 className="font-semibold text-blue-400 mb-2">💡 Recommendations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Implement flexible Wednesday schedules</li>
                <li>• Provide productivity training for Engineering</li>
                <li>• Send Monday morning reminders</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};