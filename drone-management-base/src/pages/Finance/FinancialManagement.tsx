import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Tabs,
  Tab,
  useTheme,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  MonetizationOn as ExpenseIcon,
  BarChart as ChartIcon,
  Description as InvoiceIcon,
  ReceiptLong as BillIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Upload as UploadIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

// Define status types
type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
type ExpenseStatus = 'Pending' | 'Approved' | 'Rejected' | 'Reimbursed';

// Invoice interface
interface Invoice {
  id: number;
  invoiceNumber: string;
  clientName: string;
  clientId: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  amount: number;
  tax: number;
  total: number;
  items: InvoiceItem[];
  notes: string;
}

// Invoice item interface
interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

// Expense interface
interface Expense {
  id: number;
  category: string;
  description: string;
  date: string;
  amount: number;
  status: ExpenseStatus;
  receipt: boolean;
  assignedTo: string;
  missionId?: number;
  missionName?: string;
}

// Add this interface for the budget items
interface BudgetItem {
  id: number;
  category: string;
  description: string;
  plannedAmount: number;
  actualAmount: number;
  month: string;
  year: number;
}

/**
 * Financial Management page component
 */
const FinancialManagement: React.FC = () => {
  const theme = useTheme();
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  const [invoiceTabValue, setInvoiceTabValue] = useState(0);
  const [expenseTabValue, setExpenseTabValue] = useState(0);
  const [paymentTabValue, setPaymentTabValue] = useState(0);
  
  // Dialog states
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [invoiceSuccess, setInvoiceSuccess] = useState(false);
  const [expenseSuccess, setExpenseSuccess] = useState(false);
  
  // New state for invoice reminders
  const [invoiceReminders, setInvoiceReminders] = useState<Invoice[]>([]);
  const [showRemindersDialog, setShowRemindersDialog] = useState(false);
  
  // Add this as a new state in the component
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<InvoiceItem>>({
    description: '',
    quantity: 1,
    rate: 0,
    amount: 0
  });
  
  // Sample invoices data
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 1,
      invoiceNumber: 'INV-2025-001',
      clientName: 'ABC Real Estate',
      clientId: 1,
      issueDate: '2025-03-01',
      dueDate: '2025-03-31',
      status: 'Paid',
      amount: 3000,
      tax: 240,
      total: 3240,
      items: [
        {
          id: 1,
          description: 'Aerial photography session - Downtown properties',
          quantity: 1,
          rate: 2500,
          amount: 2500
        },
        {
          id: 2,
          description: 'Photo editing and processing',
          quantity: 5,
          rate: 100,
          amount: 500
        }
      ],
      notes: 'Thank you for your business!'
    },
    {
      id: 2,
      invoiceNumber: 'INV-2025-002',
      clientName: 'City of Riverside',
      clientId: 2,
      issueDate: '2025-03-10',
      dueDate: '2025-04-09',
      status: 'Sent',
      amount: 5500,
      tax: 440,
      total: 5940,
      items: [
        {
          id: 1,
          description: 'Infrastructure mapping - North District',
          quantity: 1,
          rate: 4000,
          amount: 4000
        },
        {
          id: 2,
          description: 'Data processing and analysis',
          quantity: 15,
          rate: 100,
          amount: 1500
        }
      ],
      notes: 'Net 30 payment terms'
    },
    {
      id: 3,
      invoiceNumber: 'INV-2025-003',
      clientName: 'Green Fields Foundation',
      clientId: 3,
      issueDate: '2025-03-15',
      dueDate: '2025-03-30',
      status: 'Overdue',
      amount: 2200,
      tax: 176,
      total: 2376,
      items: [
        {
          id: 1,
          description: 'Wildlife monitoring drone survey',
          quantity: 1,
          rate: 1800,
          amount: 1800
        },
        {
          id: 2,
          description: 'Environmental data report',
          quantity: 1,
          rate: 400,
          amount: 400
        }
      ],
      notes: 'Please remit payment as soon as possible'
    },
    {
      id: 4,
      invoiceNumber: 'INV-2025-004',
      clientName: 'TechStart Inc.',
      clientId: 5,
      issueDate: '2025-03-20',
      dueDate: '2025-04-19',
      status: 'Draft',
      amount: 3600,
      tax: 288,
      total: 3888,
      items: [
        {
          id: 1,
          description: 'Product promotional video',
          quantity: 1,
          rate: 3000,
          amount: 3000
        },
        {
          id: 2,
          description: 'Additional aerial footage',
          quantity: 6,
          rate: 100,
          amount: 600
        }
      ],
      notes: 'Will be finalized after client review'
    },
    {
      id: 5,
      invoiceNumber: 'INV-2025-005',
      clientName: 'ABC Real Estate',
      clientId: 1,
      issueDate: '2025-03-25',
      dueDate: '2025-04-24',
      status: 'Sent',
      amount: 1500,
      tax: 120,
      total: 1620,
      items: [
        {
          id: 1,
          description: 'Monthly retainer - Aerial updates',
          quantity: 1,
          rate: 1500,
          amount: 1500
        }
      ],
      notes: 'Monthly service contract'
    }
  ]);
  
  // Sample expenses data
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 1,
      category: 'Equipment',
      description: 'Drone battery replacements',
      date: '2025-03-05',
      amount: 450,
      status: 'Approved',
      receipt: true,
      assignedTo: 'John Doe'
    },
    {
      id: 2,
      category: 'Travel',
      description: 'Mileage reimbursement - City mapping project',
      date: '2025-03-12',
      amount: 120,
      status: 'Reimbursed',
      receipt: true,
      assignedTo: 'Jane Smith',
      missionId: 3,
      missionName: 'City Infrastructure Mapping'
    },
    {
      id: 3,
      category: 'Software',
      description: 'Drone flight planning software subscription',
      date: '2025-03-15',
      amount: 75,
      status: 'Approved',
      receipt: true,
      assignedTo: 'Admin'
    },
    {
      id: 4,
      category: 'Maintenance',
      description: 'Drone propeller replacements',
      date: '2025-03-18',
      amount: 65,
      status: 'Pending',
      receipt: false,
      assignedTo: 'Mike Johnson'
    },
    {
      id: 5,
      category: 'Insurance',
      description: 'Drone liability insurance - Monthly premium',
      date: '2025-03-01',
      amount: 200,
      status: 'Reimbursed',
      receipt: true,
      assignedTo: 'Admin'
    }
  ]);
  
  // In the component, add this near the other state variables
  const [budgets, setBudgets] = useState<BudgetItem[]>([
    {
      id: 1,
      category: 'Equipment',
      description: 'Drone maintenance',
      plannedAmount: 1200,
      actualAmount: 950,
      month: 'July',
      year: 2025
    },
    {
      id: 2,
      category: 'Software',
      description: 'Mapping software subscription',
      plannedAmount: 400,
      actualAmount: 399,
      month: 'July',
      year: 2025
    },
    {
      id: 3,
      category: 'Travel',
      description: 'Site visits',
      plannedAmount: 600,
      actualAmount: 720,
      month: 'July',
      year: 2025
    },
    {
      id: 4,
      category: 'Marketing',
      description: 'Online advertising',
      plannedAmount: 800,
      actualAmount: 750,
      month: 'July',
      year: 2025
    },
    {
      id: 5,
      category: 'Insurance',
      description: 'Liability insurance',
      plannedAmount: 350,
      actualAmount: 350,
      month: 'July',
      year: 2025
    }
  ]);

  const [budgetTabValue, setBudgetTabValue] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState('July');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null);
  
  // Tab handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleInvoiceTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setInvoiceTabValue(newValue);
  };
  
  const handleExpenseTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setExpenseTabValue(newValue);
  };
  
  const handlePaymentTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setPaymentTabValue(newValue);
  };
  
  // Add these handler functions for budget management
  const handleBudgetTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setBudgetTabValue(newValue);
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedYear(Number(event.target.value));
  };
  
  const handleOpenBudgetDialog = (budget?: BudgetItem) => {
    if (budget) {
      setEditingBudget(budget);
    } else {
      setEditingBudget(null);
    }
    setIsBudgetDialogOpen(true);
  };

  const handleCloseBudgetDialog = () => {
    setIsBudgetDialogOpen(false);
    setEditingBudget(null);
  };

  const handleSaveBudget = () => {
    // In a real app, this would save the budget
    if (editingBudget) {
      // Update existing budget item
      const updatedBudgets = budgets.map(budget => 
        budget.id === editingBudget.id ? 
          {...editingBudget, 
            // Assume we'd get these values from form inputs in a real implementation
            description: editingBudget.description + " (Updated)",
            actualAmount: editingBudget.actualAmount
          } : budget
      );
      setBudgets(updatedBudgets);
    } else {
      // Add new budget item
      const newBudget: BudgetItem = {
        id: budgets.length + 1,
        category: 'Other',
        description: 'New budget item',
        plannedAmount: 500,
        actualAmount: 0,
        month: selectedMonth,
        year: selectedYear
      };
      setBudgets([...budgets, newBudget]);
    }
    
    setIsBudgetDialogOpen(false);
    setEditingBudget(null);
    setInvoiceSuccess(true);
    setTimeout(() => setInvoiceSuccess(false), 3000);
  };
  
  // Helper functions
  const getInvoiceStatusColor = (status: InvoiceStatus) => {
    switch(status) {
      case 'Draft': return 'default';
      case 'Sent': return 'primary';
      case 'Paid': return 'success';
      case 'Overdue': return 'error';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };
  
  const getExpenseStatusColor = (status: ExpenseStatus) => {
    switch(status) {
      case 'Pending': return 'warning';
      case 'Approved': return 'info';
      case 'Rejected': return 'error';
      case 'Reimbursed': return 'success';
      default: return 'default';
    }
  };
  
  // Filter invoices based on tab
  const filteredInvoices = () => {
    switch(invoiceTabValue) {
      case 0: // All
        return invoices;
      case 1: // Draft
        return invoices.filter(invoice => invoice.status === 'Draft');
      case 2: // Sent
        return invoices.filter(invoice => invoice.status === 'Sent');
      case 3: // Paid
        return invoices.filter(invoice => invoice.status === 'Paid');
      case 4: // Overdue
        return invoices.filter(invoice => invoice.status === 'Overdue');
      default:
        return invoices;
    }
  };
  
  // Filter expenses based on tab
  const filteredExpenses = () => {
    switch(expenseTabValue) {
      case 0: // All
        return expenses;
      case 1: // Pending
        return expenses.filter(expense => expense.status === 'Pending');
      case 2: // Approved
        return expenses.filter(expense => expense.status === 'Approved');
      case 3: // Reimbursed
        return expenses.filter(expense => expense.status === 'Reimbursed');
      default:
        return expenses;
    }
  };
  
  // Add these functions for handling invoice items
  const handleAddInvoiceItem = () => {
    if (!newItem.description || !newItem.quantity || !newItem.rate) {
      return; // Don't add incomplete items
    }
    
    const amount = (newItem.quantity || 0) * (newItem.rate || 0);
    const newInvoiceItem: InvoiceItem = {
      id: invoiceItems.length + 1,
      description: newItem.description || '',
      quantity: newItem.quantity || 0,
      rate: newItem.rate || 0,
      amount
    };
    
    setInvoiceItems([...invoiceItems, newInvoiceItem]);
    setNewItem({
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    });
  };
  
  const handleRemoveInvoiceItem = (id: number) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
  };
  
  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof InvoiceItem) => {
    const value = e.target.value;
    let updatedItem = { ...newItem, [field]: field === 'description' ? value : Number(value) };
    
    // Recalculate amount if quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      const amount = (updatedItem.quantity || 0) * (updatedItem.rate || 0);
      updatedItem = { ...updatedItem, amount };
    }
    
    setNewItem(updatedItem);
  };
  
  // Modify the handleOpenInvoiceDialog function to initialize invoice items
  const handleOpenInvoiceDialog = (invoice?: Invoice) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setInvoiceItems(invoice.items);
    } else {
      setEditingInvoice(null);
      setInvoiceItems([]);
    }
    setIsInvoiceDialogOpen(true);
  };
  
  const handleCloseInvoiceDialog = () => {
    setIsInvoiceDialogOpen(false);
    setEditingInvoice(null);
  };
  
  const handleSaveInvoice = (invoice: Invoice) => {
    // Clone the current invoices array
    const updatedInvoices = [...invoices];
    
    if (editingInvoice) {
      // Update existing invoice
      const index = updatedInvoices.findIndex(inv => inv.id === editingInvoice.id);
      if (index !== -1) {
        updatedInvoices[index] = invoice;
      }
    } else {
      // Add new invoice
      updatedInvoices.push(invoice);
    }
    
    // Update state
    setInvoices(updatedInvoices);
    setIsInvoiceDialogOpen(false);
    setEditingInvoice(null);
    setInvoiceSuccess(true);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setInvoiceSuccess(false);
    }, 3000);
  };
  
  const handleOpenExpenseDialog = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
    } else {
      setEditingExpense(null);
    }
    setIsExpenseDialogOpen(true);
  };
  
  const handleCloseExpenseDialog = () => {
    setIsExpenseDialogOpen(false);
    setEditingExpense(null);
  };
  
  const handleSaveExpense = (expense: Expense) => {
    // Clone the current expenses array
    const updatedExpenses = [...expenses];
    
    if (editingExpense) {
      // Update existing expense
      const index = updatedExpenses.findIndex(exp => exp.id === editingExpense.id);
      if (index !== -1) {
        updatedExpenses[index] = expense;
      }
    } else {
      // Add new expense
      updatedExpenses.push(expense);
    }
    
    // Update state
    setExpenses(updatedExpenses);
    setIsExpenseDialogOpen(false);
    setEditingExpense(null);
    setExpenseSuccess(true);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setExpenseSuccess(false);
    }, 3000);
  };
  
  // Calculate financial summaries
  const totalRevenue = invoices.reduce((total, invoice) => {
    if (invoice.status === 'Paid') {
      return total + invoice.total;
    }
    return total;
  }, 0);
  
  const outstandingRevenue = invoices.reduce((total, invoice) => {
    if (invoice.status === 'Sent' || invoice.status === 'Overdue') {
      return total + invoice.total;
    }
    return total;
  }, 0);
  
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  
  const netProfit = totalRevenue - totalExpenses;

  // New useEffect for invoice reminders
  useEffect(() => {
    // Find invoices that are overdue or due soon (within 7 days)
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    const overdueOrSoonDue = invoices.filter(invoice => {
      if (invoice.status === 'Paid' || invoice.status === 'Cancelled') {
        return false;
      }
      
      const dueDate = new Date(invoice.dueDate);
      return dueDate < today || (dueDate <= sevenDaysFromNow && dueDate >= today);
    });
    
    setInvoiceReminders(overdueOrSoonDue);
  }, [invoices]);

  // New function to handle opening the reminders dialog
  const handleOpenRemindersDialog = () => {
    setShowRemindersDialog(true);
  };

  const handleCloseRemindersDialog = () => {
    setShowRemindersDialog(false);
  };

  // New function to send a reminder email
  const sendReminderEmail = (invoice: Invoice) => {
    // This would connect to an email API in a real application
    console.log(`Sending reminder email for invoice ${invoice.invoiceNumber} to ${invoice.clientName}`);
    // Show success message
    setInvoiceSuccess(true);
    setTimeout(() => setInvoiceSuccess(false), 3000);
  };

  // Add these functions for handling exports
  const handleExportPDF = () => {
    // In a real implementation, this would connect to a PDF generation library
    // such as jsPDF, PDFKit, or a server-side PDF generation service
    
    // Example of what the implementation might do:
    console.log('Generating PDF report...');
    
    // Prepare data for export
    const reportData = {
      title: 'Financial Report',
      date: new Date().toISOString().split('T')[0],
      revenue: {
        monthly: [
          { name: 'Jan', revenue: 4000 },
          { name: 'Feb', revenue: 3000 },
          { name: 'Mar', revenue: 5000 },
          { name: 'Apr', revenue: 7000 },
          { name: 'May', revenue: 6000 },
          { name: 'Jun', revenue: 8000 },
        ]
      },
      expenses: {
        categories: [
          { name: 'Equipment', value: 5500 },
          { name: 'Travel', value: 3200 },
          { name: 'Software', value: 2100 },
          { name: 'Maintenance', value: 1800 },
          { name: 'Insurance', value: 3000 },
          { name: 'Other', value: 1400 },
        ]
      },
      cashFlow: [
        { name: 'Jan', income: 4000, expenses: 2400, profit: 1600 },
        { name: 'Feb', income: 3000, expenses: 1398, profit: 1602 },
        { name: 'Mar', income: 5000, expenses: 3800, profit: 1200 },
        { name: 'Apr', income: 7000, expenses: 3908, profit: 3092 },
        { name: 'May', income: 6000, expenses: 4800, profit: 1200 },
        { name: 'Jun', income: 8000, expenses: 3800, profit: 4200 },
      ],
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit,
        outstandingRevenue
      }
    };
    
    // Show a notification of success
    setInvoiceSuccess(true);
    setTimeout(() => setInvoiceSuccess(false), 3000);
    
    // In a real app, we would trigger a download here
    // For demo purposes, we'll just log the data
    console.log('PDF Export Data:', reportData);
  };

  const handleExportExcel = () => {
    // In a real implementation, this would connect to an Excel generation library
    // such as xlsx, exceljs, or a server-side Excel generation service
    
    // Example of what the implementation might do:
    console.log('Generating Excel report...');
    
    // Prepare data in a format suitable for Excel
    const worksheetData = [
      ['Financial Report', '', '', '', ''],
      ['Date:', new Date().toLocaleDateString(), '', '', ''],
      ['', '', '', '', ''],
      ['Monthly Revenue', '', '', '', ''],
      ['Month', 'Revenue', '', '', ''],
      ['Jan', 4000, '', '', ''],
      ['Feb', 3000, '', '', ''],
      ['Mar', 5000, '', '', ''],
      ['Apr', 7000, '', '', ''],
      ['May', 6000, '', '', ''],
      ['Jun', 8000, '', '', ''],
      ['', '', '', '', ''],
      ['Expense Breakdown', '', '', '', ''],
      ['Category', 'Amount', '', '', ''],
      ['Equipment', 5500, '', '', ''],
      ['Travel', 3200, '', '', ''],
      ['Software', 2100, '', '', ''],
      ['Maintenance', 1800, '', '', ''],
      ['Insurance', 3000, '', '', ''],
      ['Other', 1400, '', '', ''],
      ['', '', '', '', ''],
      ['Cash Flow', '', '', '', ''],
      ['Month', 'Income', 'Expenses', 'Profit', ''],
      ['Jan', 4000, 2400, 1600, ''],
      ['Feb', 3000, 1398, 1602, ''],
      ['Mar', 5000, 3800, 1200, ''],
      ['Apr', 7000, 3908, 3092, ''],
      ['May', 6000, 4800, 1200, ''],
      ['Jun', 8000, 3800, 4200, ''],
      ['', '', '', '', ''],
      ['Summary', '', '', '', ''],
      ['Total Revenue:', `$${totalRevenue.toLocaleString()}`, '', '', ''],
      ['Outstanding Revenue:', `$${outstandingRevenue.toLocaleString()}`, '', '', ''],
      ['Total Expenses:', `$${totalExpenses.toLocaleString()}`, '', '', ''],
      ['Net Profit:', `$${netProfit.toLocaleString()}`, '', '', '']
    ];
    
    // Show a notification of success
    setInvoiceSuccess(true);
    setTimeout(() => setInvoiceSuccess(false), 3000);
    
    // In a real app, we would trigger a download here
    // For demo purposes, we'll just log the data
    console.log('Excel Export Data:', worksheetData);
  };

  // Calculate budget statistics
  const totalPlannedBudget = budgets.reduce((total, budget) => total + budget.plannedAmount, 0);
  const totalActualSpent = budgets.reduce((total, budget) => total + budget.actualAmount, 0);
  const budgetVariance = totalPlannedBudget - totalActualSpent;
  const budgetVariancePercentage = ((budgetVariance / totalPlannedBudget) * 100).toFixed(1);

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Financial Management
          </Typography>
        </Box>
        
        {/* Financial Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6" color="text.secondary">
                    Total Revenue
                  </Typography>
                  <ReceiptIcon color="success" />
                </Box>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  ${totalRevenue.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6" color="text.secondary">
                    Outstanding
                  </Typography>
                  <ReceiptIcon color="warning" />
                </Box>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  ${outstandingRevenue.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6" color="text.secondary">
                    Total Expenses
                  </Typography>
                  <ExpenseIcon color="error" />
                </Box>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  ${totalExpenses.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6" color="text.secondary">
                    Net Profit
                  </Typography>
                  <ChartIcon color={netProfit >= 0 ? "primary" : "error"} />
                </Box>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: netProfit >= 0 ? theme.palette.success.main : theme.palette.error.main }}>
                  ${netProfit.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Main Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="Invoices" />
            <Tab label="Expenses" />
            <Tab label="Reports" />
            <Tab label="Payments" />
            <Tab label="Budget" />
          </Tabs>
        </Box>
        
        {/* Tab content */}
        {tabValue === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Manage Invoices
              </Typography>
              <Box>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  sx={{ mr: 1 }}
                  onClick={() => handleOpenInvoiceDialog()}
                >
                  New Invoice
                </Button>
              </Box>
            </Box>
            
            <Card>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={invoiceTabValue} onChange={handleInvoiceTabChange} aria-label="invoice tabs">
                  <Tab label="All Invoices" />
                  <Tab label="Drafts" />
                  <Tab label="Sent" />
                  <Tab label="Paid" />
                  <Tab label="Overdue" />
                </Tabs>
              </Box>
              <CardContent>
                <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Invoice #</TableCell>
                        <TableCell>Client</TableCell>
                        <TableCell>Issue Date</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredInvoices().map((invoice) => (
                        <TableRow key={invoice.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <InvoiceIcon sx={{ mr: 1, fontSize: 20 }} />
                              {invoice.invoiceNumber}
                            </Box>
                          </TableCell>
                          <TableCell>{invoice.clientName}</TableCell>
                          <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>${invoice.total.toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip 
                              label={invoice.status} 
                              color={getInvoiceStatusColor(invoice.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleOpenInvoiceDialog(invoice)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="primary"
                            >
                              <PrintIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="primary"
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}
        
        {tabValue === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Manage Expenses
              </Typography>
              <Box>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  sx={{ mr: 1 }}
                  onClick={() => handleOpenExpenseDialog()}
                >
                  New Expense
                </Button>
              </Box>
            </Box>
            
            <Card>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={expenseTabValue} onChange={handleExpenseTabChange} aria-label="expense tabs">
                  <Tab label="All Expenses" />
                  <Tab label="Pending" />
                  <Tab label="Approved" />
                  <Tab label="Reimbursed" />
                </Tabs>
              </Box>
              <CardContent>
                <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Assigned To</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredExpenses().map((expense) => (
                        <TableRow key={expense.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <BillIcon sx={{ mr: 1, fontSize: 20 }} />
                              <Typography>
                                {expense.description}
                                {expense.receipt && (
                                  <Chip
                                    label="Receipt" 
                                    size="small"
                                    variant="outlined"
                                    sx={{ ml: 1, height: 18, fontSize: '0.625rem' }}
                                  />
                                )}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                          <TableCell>${expense.amount.toLocaleString()}</TableCell>
                          <TableCell>{expense.assignedTo}</TableCell>
                          <TableCell>
                            <Chip 
                              label={expense.status} 
                              color={getExpenseStatusColor(expense.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleOpenExpenseDialog(expense)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="primary"
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}
        
        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Financial Reports
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Monthly Revenue
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { name: 'Jan', revenue: 4000 },
                        { name: 'Feb', revenue: 3000 },
                        { name: 'Mar', revenue: 5000 },
                        { name: 'Apr', revenue: 7000 },
                        { name: 'May', revenue: 6000 },
                        { name: 'Jun', revenue: 8000 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#3f51b5" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Expense Breakdown
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Equipment', value: 5500 },
                          { name: 'Travel', value: 3200 },
                          { name: 'Software', value: 2100 },
                          { name: 'Maintenance', value: 1800 },
                          { name: 'Insurance', value: 3000 },
                          { name: 'Other', value: 1400 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#3f51b5" />
                        <Cell fill="#f50057" />
                        <Cell fill="#00bcd4" />
                        <Cell fill="#ff9800" />
                        <Cell fill="#4caf50" />
                        <Cell fill="#9c27b0" />
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Cash Flow
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={[
                        { name: 'Jan', income: 4000, expenses: 2400, profit: 1600 },
                        { name: 'Feb', income: 3000, expenses: 1398, profit: 1602 },
                        { name: 'Mar', income: 5000, expenses: 3800, profit: 1200 },
                        { name: 'Apr', income: 7000, expenses: 3908, profit: 3092 },
                        { name: 'May', income: 6000, expenses: 4800, profit: 1200 },
                        { name: 'Jun', income: 8000, expenses: 3800, profit: 4200 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, '']} />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#3f51b5" />
                      <Line type="monotone" dataKey="expenses" stroke="#f50057" />
                      <Line type="monotone" dataKey="profit" stroke="#4caf50" />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Revenue Forecast (Next 6 Months)
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={[
                        { month: 'Jul', projected: 8500, confirmed: 6800 },
                        { month: 'Aug', projected: 9200, confirmed: 5500 },
                        { month: 'Sep', projected: 9800, confirmed: 4200 },
                        { month: 'Oct', projected: 10500, confirmed: 3500 },
                        { month: 'Nov', projected: 11000, confirmed: 2000 },
                        { month: 'Dec', projected: 12000, confirmed: 1000 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, '']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="projected" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="confirmed" 
                        stroke="#82ca9d"
                        strokeWidth={2} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      The forecast is based on recurring clients, scheduled missions, and historical data. Purple line shows projected revenue, while green represents confirmed revenue.
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<DownloadIcon />}
                    sx={{ mr: 1 }}
                    onClick={handleExportPDF}
                  >
                    Export PDF
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<DownloadIcon />}
                    onClick={handleExportExcel}
                  >
                    Export Excel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {tabValue === 3 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Payment Tracking
              </Typography>
              <Box>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  sx={{ mr: 1 }}
                >
                  Record Payment
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />}
                >
                  Refresh
                </Button>
              </Box>
            </Box>
            
            <Paper variant="outlined" sx={{ mb: 3 }}>
              <Tabs
                value={paymentTabValue}
                onChange={handlePaymentTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                <Tab label="All Payments" />
                <Tab label="Incoming" />
                <Tab label="Outgoing" />
              </Tabs>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Reference</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { 
                        id: 1, 
                        date: '2023-06-15', 
                        reference: 'INV-2023-042', 
                        description: 'Payment for Aerial Photography Services', 
                        method: 'Credit Card',
                        amount: 2500,
                        type: 'incoming',
                        status: 'Completed'
                      },
                      { 
                        id: 2, 
                        date: '2023-06-20', 
                        reference: 'EXP-2023-027', 
                        description: 'Drone Repair Parts', 
                        method: 'Bank Transfer',
                        amount: 450,
                        type: 'outgoing',
                        status: 'Completed'
                      },
                      { 
                        id: 3, 
                        date: '2023-06-30', 
                        reference: 'INV-2023-051', 
                        description: 'Infrastructure Mapping Project - Initial Payment', 
                        method: 'Bank Transfer',
                        amount: 5000,
                        type: 'incoming',
                        status: 'Pending'
                      },
                      { 
                        id: 4, 
                        date: '2023-07-02', 
                        reference: 'EXP-2023-035', 
                        description: 'Software License Renewal', 
                        method: 'Credit Card',
                        amount: 1200,
                        type: 'outgoing',
                        status: 'Completed'
                      },
                      { 
                        id: 5, 
                        date: '2023-07-05', 
                        reference: 'INV-2023-058', 
                        description: 'Monthly Retainer - City Monitoring', 
                        method: 'Bank Transfer',
                        amount: 3500,
                        type: 'incoming',
                        status: 'Completed'
                      },
                    ]
                      .filter(payment => {
                        if (paymentTabValue === 0) return true;
                        if (paymentTabValue === 1) return payment.type === 'incoming';
                        if (paymentTabValue === 2) return payment.type === 'outgoing';
                        return true;
                      })
                      .map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>{payment.reference}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ 
                            color: payment.type === 'incoming' ? 'success.main' : 'error.main',
                            fontWeight: 'medium'
                          }}>
                            {payment.type === 'incoming' ? '+' : '-'}${payment.amount.toLocaleString()}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={payment.status} 
                            size="small"
                            color={payment.status === 'Completed' ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small">
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Paper variant="outlined" sx={{ p: 2, flexGrow: 1, minWidth: 300 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Payment Methods
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Method</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Bank Transfer</TableCell>
                      <TableCell align="right">3</TableCell>
                      <TableCell align="right">$8,950</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Credit Card</TableCell>
                      <TableCell align="right">2</TableCell>
                      <TableCell align="right">$3,700</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>PayPal</TableCell>
                      <TableCell align="right">0</TableCell>
                      <TableCell align="right">$0</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
              
              <Paper variant="outlined" sx={{ p: 2, flexGrow: 1, minWidth: 300 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Cash Flow Summary
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Incoming</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'medium' }}>
                        +$11,000
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Outgoing</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'medium' }}>
                        -$1,650
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Net Cash Flow</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        $9,350
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    fullWidth
                  >
                    Download Statement
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Box>
        )}

        {tabValue === 4 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Budget Planning
              </Typography>
              <Box>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  sx={{ mr: 1 }}
                  onClick={() => handleOpenBudgetDialog()}
                >
                  Add Budget Item
                </Button>
              </Box>
            </Box>
            
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6" color="text.secondary">
                        Planned Budget
                      </Typography>
                      <ChartIcon color="primary" />
                    </Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                      ${totalPlannedBudget.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6" color="text.secondary">
                        Actual Spent
                      </Typography>
                      <ExpenseIcon color={totalActualSpent > totalPlannedBudget ? "error" : "success"} />
                    </Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                      ${totalActualSpent.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6" color="text.secondary">
                        Variance
                      </Typography>
                      <ChartIcon color={budgetVariance >= 0 ? "success" : "error"} />
                    </Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: budgetVariance >= 0 ? theme.palette.success.main : theme.palette.error.main }}>
                      ${budgetVariance.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6" color="text.secondary">
                        % of Budget
                      </Typography>
                      <ChartIcon color={budgetVariance >= 0 ? "success" : "error"} />
                    </Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: budgetVariance >= 0 ? theme.palette.success.main : theme.palette.error.main }}>
                      {budgetVariance >= 0 ? `${budgetVariancePercentage}% under` : `${Math.abs(Number(budgetVariancePercentage))}% over`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Paper variant="outlined" sx={{ mb: 3 }}>
              <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ mr: 2 }}>Period:</Typography>
                  <TextField
                    select
                    variant="outlined"
                    size="small"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    sx={{ mr: 2, minWidth: 120 }}
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                      <MenuItem key={month} value={month}>{month}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    variant="outlined"
                    size="small"
                    value={selectedYear}
                    onChange={handleYearChange}
                    sx={{ minWidth: 100 }}
                  >
                    {[2023, 2024, 2025, 2026].map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </TextField>
                </Box>
                <Button 
                  variant="outlined" 
                  startIcon={<DownloadIcon />}
                >
                  Export Budget
                </Button>
              </Box>
              
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={budgetTabValue} onChange={handleBudgetTabChange} aria-label="budget tabs">
                  <Tab label="All Categories" />
                  <Tab label="Equipment" />
                  <Tab label="Software" />
                  <Tab label="Travel" />
                  <Tab label="Marketing" />
                </Tabs>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Planned Amount</TableCell>
                      <TableCell align="right">Actual Amount</TableCell>
                      <TableCell align="right">Variance</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {budgets
                      .filter(budget => {
                        if (budgetTabValue === 0) return true;
                        if (budgetTabValue === 1) return budget.category === 'Equipment';
                        if (budgetTabValue === 2) return budget.category === 'Software';
                        if (budgetTabValue === 3) return budget.category === 'Travel';
                        if (budgetTabValue === 4) return budget.category === 'Marketing';
                        return true;
                      })
                      .map((budget) => {
                        const variance = budget.plannedAmount - budget.actualAmount;
                        const isOverBudget = variance < 0;
                        
                        return (
                          <TableRow key={budget.id} hover>
                            <TableCell>{budget.category}</TableCell>
                            <TableCell>{budget.description}</TableCell>
                            <TableCell align="right">${budget.plannedAmount.toLocaleString()}</TableCell>
                            <TableCell align="right">${budget.actualAmount.toLocaleString()}</TableCell>
                            <TableCell 
                              align="right" 
                              sx={{ 
                                color: isOverBudget ? theme.palette.error.main : theme.palette.success.main,
                                fontWeight: 'medium'
                              }}
                            >
                              {isOverBudget ? `-$${Math.abs(variance).toLocaleString()}` : `$${variance.toLocaleString()}`}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleOpenBudgetDialog(budget)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Budget vs. Actual by Category
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { name: 'Equipment', planned: 1200, actual: 950 },
                        { name: 'Software', planned: 400, actual: 399 },
                        { name: 'Travel', planned: 600, actual: 720 },
                        { name: 'Marketing', planned: 800, actual: 750 },
                        { name: 'Insurance', planned: 350, actual: 350 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, '']} />
                      <Legend />
                      <Bar dataKey="planned" fill="#8884d8" />
                      <Bar dataKey="actual" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Budget Allocation
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Equipment', value: 1200 },
                          { name: 'Software', value: 400 },
                          { name: 'Travel', value: 600 },
                          { name: 'Marketing', value: 800 },
                          { name: 'Insurance', value: 350 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#8884d8" />
                        <Cell fill="#82ca9d" />
                        <Cell fill="#ffc658" />
                        <Cell fill="#ff8042" />
                        <Cell fill="#0088fe" />
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, 'Planned Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Invoice Reminders Block */}
        {invoiceReminders.length > 0 && (
          <Box sx={{ mt: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                display: 'flex',
                alignItems: 'center',
                backgroundColor: theme.palette.warning.light,
                width: '100%'
              }}
            >
              <WarningIcon color="warning" sx={{ mr: 2 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Invoice Reminders
                </Typography>
                <Typography variant="body2">
                  You have {invoiceReminders.length} {invoiceReminders.length === 1 ? 'invoice' : 'invoices'} that {invoiceReminders.length === 1 ? 'is' : 'are'} either overdue or due soon.
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                color="warning" 
                onClick={handleOpenRemindersDialog}
                startIcon={<NotificationsIcon />}
              >
                View Reminders
              </Button>
            </Paper>
          </Box>
        )}
      </Box>

      {/* Budget Dialog */}
      <Dialog 
        open={isBudgetDialogOpen} 
        onClose={handleCloseBudgetDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingBudget ? 'Edit Budget Item' : 'Add Budget Item'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  defaultValue={editingBudget?.category || ""}
                  label="Category"
                >
                  <MenuItem value="Equipment">Equipment</MenuItem>
                  <MenuItem value="Software">Software</MenuItem>
                  <MenuItem value="Travel">Travel</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Insurance">Insurance</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Month</InputLabel>
                <Select
                  defaultValue={editingBudget?.month || selectedMonth}
                  label="Month"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                    <MenuItem key={month} value={month}>{month}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                margin="normal"
                defaultValue={editingBudget?.description || ""}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Planned Amount"
                type="number"
                variant="outlined"
                margin="normal"
                defaultValue={editingBudget?.plannedAmount || ""}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Actual Amount"
                type="number"
                variant="outlined"
                margin="normal"
                defaultValue={editingBudget?.actualAmount || "0"}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBudgetDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSaveBudget}
          >
            Save Budget Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog 
        open={isInvoiceDialogOpen} 
        onClose={handleCloseInvoiceDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingInvoice ? 'Edit Invoice' : 'Add New Invoice'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Invoice Number"
                variant="outlined"
                margin="normal"
                defaultValue={editingInvoice?.invoiceNumber || ""}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Client</InputLabel>
                <Select
                  defaultValue={editingInvoice?.clientId.toString() || ""}
                  label="Client"
                >
                  <MenuItem value="1">ABC Real Estate</MenuItem>
                  <MenuItem value="2">City of Riverside</MenuItem>
                  <MenuItem value="3">Green Fields Foundation</MenuItem>
                  <MenuItem value="5">TechStart Inc.</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Issue Date</InputLabel>
                <TextField
                  type="date"
                  variant="outlined"
                  margin="normal"
                  defaultValue={editingInvoice?.issueDate || new Date().toISOString().split('T')[0]}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Due Date</InputLabel>
                <TextField
                  type="date"
                  variant="outlined"
                  margin="normal"
                  defaultValue={editingInvoice?.dueDate || new Date().toISOString().split('T')[0]}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Amount</InputLabel>
                <TextField
                  type="number"
                  variant="outlined"
                  margin="normal"
                  defaultValue={editingInvoice?.amount.toLocaleString() || ""}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Tax (8%)</InputLabel>
                <TextField
                  type="number"
                  variant="outlined"
                  margin="normal"
                  defaultValue={editingInvoice?.tax.toLocaleString() || ""}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Total</InputLabel>
                <TextField
                  type="number"
                  variant="outlined"
                  margin="normal"
                  defaultValue={editingInvoice?.total.toLocaleString() || ""}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Invoice Items
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Rate</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoiceItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${item.rate.toLocaleString()}</TableCell>
                        <TableCell align="right">${item.amount.toLocaleString()}</TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleRemoveInvoiceItem(item.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Add new item row */}
                    <TableRow>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Description"
                          value={newItem.description}
                          onChange={(e) => handleItemChange(e, 'description')}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          size="small"
                          type="number"
                          inputProps={{ min: 1, style: { textAlign: 'right' } }}
                          value={newItem.quantity}
                          onChange={(e) => handleItemChange(e, 'quantity')}
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          size="small"
                          type="number"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            inputProps: { min: 0, style: { textAlign: 'right' } }
                          }}
                          value={newItem.rate}
                          onChange={(e) => handleItemChange(e, 'rate')}
                          sx={{ width: 120 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        ${((newItem.quantity || 0) * (newItem.rate || 0)).toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        <Button 
                          variant="contained" 
                          color="primary" 
                          size="small"
                          onClick={handleAddInvoiceItem}
                        >
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    {/* Summary row */}
                    {invoiceItems.length > 0 && (
                      <>
                        <TableRow>
                          <TableCell colSpan={3} align="right">
                            <Typography variant="subtitle2">Subtotal:</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2">
                              ${invoiceItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell />
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3} align="right">
                            <Typography variant="subtitle2">Tax (8%):</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2">
                              ${(invoiceItems.reduce((sum, item) => sum + item.amount, 0) * 0.08).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell />
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3} align="right">
                            <Typography variant="subtitle2" fontWeight="bold">Total:</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2" fontWeight="bold">
                              ${(invoiceItems.reduce((sum, item) => sum + item.amount, 0) * 1.08).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                variant="outlined"
                margin="normal"
                defaultValue={editingInvoice?.notes || ""}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInvoiceDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              // For demo purposes, we'll just close the dialog
              handleCloseInvoiceDialog();
              setInvoiceSuccess(true);
              setTimeout(() => setInvoiceSuccess(false), 3000);
            }}
          >
            Save Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog 
        open={isExpenseDialogOpen} 
        onClose={handleCloseExpenseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingExpense ? 'Edit Expense' : 'Add New Expense'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                margin="normal"
                defaultValue={editingExpense?.description || ""}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  defaultValue={editingExpense?.category || ""}
                  label="Category"
                >
                  <MenuItem value="Equipment">Equipment</MenuItem>
                  <MenuItem value="Travel">Travel</MenuItem>
                  <MenuItem value="Software">Software</MenuItem>
                  <MenuItem value="Maintenance">Maintenance</MenuItem>
                  <MenuItem value="Insurance">Insurance</MenuItem>
                  <MenuItem value="Office">Office</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                variant="outlined"
                margin="normal"
                defaultValue={editingExpense?.amount || ""}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                variant="outlined"
                margin="normal"
                defaultValue={editingExpense?.date || new Date().toISOString().split('T')[0]}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  defaultValue={editingExpense?.status || "Pending"}
                  label="Status"
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Reimbursed">Reimbursed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Assigned To</InputLabel>
                <Select
                  defaultValue={editingExpense?.assignedTo || ""}
                  label="Assigned To"
                >
                  <MenuItem value="John Doe">John Doe</MenuItem>
                  <MenuItem value="Jane Smith">Jane Smith</MenuItem>
                  <MenuItem value="Mike Johnson">Mike Johnson</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Mission (Optional)</InputLabel>
                <Select
                  defaultValue={(editingExpense?.missionId || "").toString()}
                  label="Mission (Optional)"
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="1">Aerial Real Estate Photography</MenuItem>
                  <MenuItem value="2">Wildlife Monitoring Survey</MenuItem>
                  <MenuItem value="3">City Infrastructure Mapping</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" sx={{ mr: 2 }}>Receipt Uploaded:</Typography>
                <Chip 
                  label={editingExpense?.receipt ? "Receipt Attached" : "No Receipt"} 
                  color={editingExpense?.receipt ? "success" : "default"}
                  size="small"
                />
                <Button 
                  size="small" 
                  startIcon={<UploadIcon />}
                  sx={{ ml: 2 }}
                >
                  Upload
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExpenseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              // For demo purposes, we'll just close the dialog
              handleCloseExpenseDialog();
              setExpenseSuccess(true);
              setTimeout(() => setExpenseSuccess(false), 3000);
            }}
          >
            Save Expense
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reminders Dialog */}
      <Dialog 
        open={showRemindersDialog} 
        onClose={handleCloseRemindersDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Invoice Reminders
        </DialogTitle>
        <DialogContent dividers>
          {invoiceReminders.length === 0 ? (
            <Typography>No invoice reminders at this time.</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoiceReminders.map((invoice) => {
                    const dueDate = new Date(invoice.dueDate);
                    const today = new Date();
                    const isOverdue = dueDate < today;
                    
                    return (
                      <TableRow key={invoice.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <InvoiceIcon sx={{ mr: 1, fontSize: 20 }} />
                            {invoice.invoiceNumber}
                          </Box>
                        </TableCell>
                        <TableCell>{invoice.clientName}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', color: isOverdue ? 'error.main' : 'warning.main' }}>
                            {new Date(invoice.dueDate).toLocaleDateString()}
                            {isOverdue && <Chip size="small" label="OVERDUE" color="error" sx={{ ml: 1 }} />}
                          </Box>
                        </TableCell>
                        <TableCell>${invoice.total.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={invoice.status} 
                            color={getInvoiceStatusColor(invoice.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            startIcon={<EmailIcon />}
                            onClick={() => sendReminderEmail(invoice)}
                          >
                            Send Reminder
                          </Button>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenInvoiceDialog(invoice)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemindersDialog}>Close</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              // This would send reminders for all outstanding invoices
              invoiceReminders.forEach(invoice => {
                sendReminderEmail(invoice);
              });
              handleCloseRemindersDialog();
            }}
            startIcon={<SendIcon />}
          >
            Send All Reminders
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbars */}
      <Snackbar
        open={invoiceSuccess}
        autoHideDuration={3000}
        onClose={() => setInvoiceSuccess(false)}
      >
        <Alert onClose={() => setInvoiceSuccess(false)} severity="success">
          Invoice saved successfully!
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={expenseSuccess}
        autoHideDuration={3000}
        onClose={() => setExpenseSuccess(false)}
      >
        <Alert onClose={() => setExpenseSuccess(false)} severity="success">
          Expense saved successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default FinancialManagement; 