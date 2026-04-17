import { 
    LayoutDashboard, 
    Users, 
    UserRound, 
    BookOpen, 
    CalendarCheck, 
    GraduationCap, 
    CreditCard, 
    FileSpreadsheet, 
    Wallet,
    LogOut,
    Menu
} from 'lucide-react';

export const menuItems = {
    superadmin: [
        { path: '/superadmin/dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/superadmin/students', name: 'Students', icon: GraduationCap },
        { path: '/superadmin/staff', name: 'Staff', icon: Users },
        { path: '/superadmin/attendance', name: 'Attendance', icon: CalendarCheck },
        { path: '/superadmin/courses', name: 'Courses', icon: BookOpen },
        { path: '/superadmin/schedule', name: 'Schedule', icon: FileSpreadsheet },
        { path: '/superadmin/payments', name: 'Payments', icon: CreditCard },
        { path: '/superadmin/expenses', name: 'Expenses', icon: Wallet },
        { path: '/superadmin/finance', name: 'Finance', icon: Wallet },
    ],
    admin: [
        { path: '/admin/dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/students', name: 'Students', icon: GraduationCap },
        { path: '/admin/staff', name: 'Staff', icon: Users },
        { path: '/admin/attendance', name: 'Attendance', icon: CalendarCheck },
        { path: '/admin/courses', name: 'Courses', icon: BookOpen },
        { path: '/admin/schedule', name: 'Schedule', icon: FileSpreadsheet },
        { path: '/admin/payments', name: 'Payments', icon: CreditCard },
    ],
    staff: [
        { path: '/staff/dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/staff/subjects', name: 'Subjects', icon: BookOpen },
        { path: '/staff/attendance', name: 'Attendance', icon: CalendarCheck },
        { path: '/staff/marks', name: 'Marks', icon: GraduationCap },
        { path: '/staff/schedule', name: 'Schedule', icon: FileSpreadsheet },
        { path: '/staff/salary', name: 'Salary', icon: Wallet },
        { path: '/staff/profile', name: 'Profile', icon: UserRound },
    ],
    student: [
        { path: '/student/dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/student/marks', name: 'Marks', icon: GraduationCap },
        { path: '/student/attendance', name: 'Attendance', icon: CalendarCheck },
        { path: '/student/profile', name: 'Profile', icon: UserRound },
    ]
};
