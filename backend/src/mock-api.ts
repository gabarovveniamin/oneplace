import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json());

// Mock data
let jobs: any[] = [
  {
    id: '1',
    title: 'Frontend разработчик',
    company: 'TechCorp',
    salary: '150 000 - 200 000 ₽',
    location: 'Москва',
    type: 'full-time',
    description: 'Ищем опытного frontend разработчика для работы с React и TypeScript',
    tags: ['React', 'TypeScript', 'JavaScript'],
    specialization: 'Frontend разработка',
    industry: 'IT',
    region: 'Москва',
    salaryFrom: 150000,
    salaryTo: 200000,
    salaryFrequency: 'monthly',
    education: 'bachelor',
    experience: '3-5-years',
    employmentType: 'full-time',
    schedule: 'flexible',
    workHours: 8,
    workFormat: 'hybrid',
    postedBy: 'user1',
    isActive: true,
    isFeatured: false,
    views: 0,
    applications: 0,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    postedByUser: {
      id: 'user1',
      firstName: 'Иван',
      lastName: 'Петров',
      email: 'ivan@techcorp.com'
    }
  }
];

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mock API Server is running',
    timestamp: new Date().toISOString(),
    environment: 'development',
  });
});

// Get all jobs
app.get('/api/jobs', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedJobs = jobs.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedJobs,
    pagination: {
      page,
      limit,
      total: jobs.length,
      totalPages: Math.ceil(jobs.length / limit),
    },
  });
});

// Get job by ID
app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found',
    });
  }
  
  // Increment views
  job.views += 1;
  
  res.json({
    success: true,
    data: job,
  });
});

// Create new job
app.post('/api/jobs', (req, res) => {
  const newJob = {
    id: (jobs.length + 1).toString(),
    ...req.body,
    postedBy: 'user1', // Mock user ID
    isActive: true,
    isFeatured: false,
    views: 0,
    applications: 0,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    postedByUser: {
      id: 'user1',
      firstName: 'Иван',
      lastName: 'Петров',
      email: 'ivan@techcorp.com'
    }
  };
  
  jobs.push(newJob);
  
  res.status(201).json({
    success: true,
    message: 'Job created successfully',
    data: newJob,
  });
});

// Search jobs
app.get('/api/jobs/search', (req, res) => {
  let filteredJobs = [...jobs];
  
  // Apply filters
  if (req.query.keyword) {
    const keyword = (req.query.keyword as string).toLowerCase();
    filteredJobs = filteredJobs.filter(job => 
      job.title.toLowerCase().includes(keyword) ||
      job.description.toLowerCase().includes(keyword) ||
      job.company.toLowerCase().includes(keyword)
    );
  }
  
  if (req.query.type) {
    filteredJobs = filteredJobs.filter(job => job.type === req.query.type);
  }
  
  if (req.query.specialization) {
    filteredJobs = filteredJobs.filter(job => job.specialization === req.query.specialization);
  }
  
  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedJobs,
    pagination: {
      page,
      limit,
      total: filteredJobs.length,
      totalPages: Math.ceil(filteredJobs.length / limit),
    },
  });
});

// Get popular jobs
app.get('/api/jobs/popular', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const popularJobs = jobs
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
  
  res.json({
    success: true,
    data: popularJobs,
  });
});

// Get recent jobs
app.get('/api/jobs/recent', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const recentJobs = jobs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
  
  res.json({
    success: true,
    data: recentJobs,
  });
});

// Get jobs stats
app.get('/api/jobs/stats', (req, res) => {
  const byType = jobs.reduce((acc, job) => {
    acc[job.type] = (acc[job.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byIndustry = jobs.reduce((acc, job) => {
    if (job.industry) {
      acc[job.industry] = (acc[job.industry] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const byRegion = jobs.reduce((acc, job) => {
    if (job.region) {
      acc[job.region] = (acc[job.region] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  res.json({
    success: true,
    data: {
      total: jobs.length,
      byType,
      byIndustry,
      byRegion,
    },
  });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on port ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`💾 Using mock data (${jobs.length} jobs)`);
});

export default app;
