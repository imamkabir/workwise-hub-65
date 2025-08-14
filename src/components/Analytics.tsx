import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const attendanceData = [
  { day: 'Mon', present: 195, absent: 53, late: 12 },
  { day: 'Tue', present: 203, absent: 45, late: 8 },
  { day: 'Wed', present: 187, absent: 61, late: 15 },
  { day: 'Thu', present: 210, absent: 38, late: 6 },
  { day: 'Fri', present: 198, absent: 50, late: 10 },
  { day: 'Sat', present: 165, absent: 83, late: 5 },
  { day: 'Sun', present: 142, absent: 106, late: 3 },
];

const departmentData = [
  { name: 'Engineering', value: 45, color: '#00bcd4' },
  { name: 'Marketing', value: 25, color: '#4caf50' },
  { name: 'Sales', value: 20, color: '#ff9800' },
  { name: 'HR', value: 10, color: '#e91e63' },
];

const productivityData = [
  { month: 'Jan', productivity: 85 },
  { month: 'Feb', productivity: 88 },
  { month: 'Mar', productivity: 82 },
  { month: 'Apr', productivity: 90 },
  { month: 'May', productivity: 87 },
  { month: 'Jun', productivity: 92 },
];

export const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">78.6%</div>
            <p className="text-sm text-muted-foreground">+2.1% from last week</p>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Average Check-in</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">09:12</div>
            <p className="text-sm text-muted-foreground">12 min earlier than target</p>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Overtime Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">124h</div>
            <p className="text-sm text-muted-foreground">-8% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Weekly Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
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
                <Line type="monotone" dataKey="present" stroke="#00bcd4" strokeWidth={3} />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
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
            <CardTitle>Monthly Productivity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productivityData}>
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
                <Bar dataKey="productivity" fill="#00bcd4" radius={[4, 4, 0, 0]} />
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