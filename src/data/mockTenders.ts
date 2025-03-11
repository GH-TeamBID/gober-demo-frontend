
import { Tender } from '@/types/types';

// Mock data for demonstration
export const MOCK_TENDERS: Tender[] = [
  {
    id: 'T-2023-001',
    title: 'Healthcare Technology Infrastructure Upgrade',
    description: 'Seeking proposals for upgrading the IT infrastructure across regional health centers to improve patient data management and telehealth capabilities.',
    submitOn: '2023-12-15',
    lots: 3,
    organisation: 'Ministry of Health',
    budget: 1250000,
    location: 'New South Wales',
    contractType: 'Services',
    category: 'Healthcare',
    status: 'Open',
    updatedOn: '2023-10-01',
    aiSummary: 'This tender seeks to modernize healthcare IT infrastructure with a focus on patient data security and telehealth integration. Key requirements include cloud migration, security compliance, and scalable solutions for future expansion. The total budget is $1.25M with a December 15, 2023 deadline. The contract includes ongoing maintenance for 3 years post-implementation.'
  },
  {
    id: 'T-2023-002',
    title: 'Sustainable Urban Transportation Planning',
    description: 'Consultation services needed for developing an integrated sustainable urban transportation plan focusing on reducing carbon emissions and improving public transit efficiency.',
    submitOn: '2023-11-30',
    lots: 1,
    organisation: 'City Council',
    budget: 350000,
    location: 'Victoria',
    contractType: 'Consultation',
    category: 'Transportation',
    status: 'Open',
    updatedOn: '2023-09-15',
    aiSummary: 'This transportation planning tender focuses on sustainability and emissions reduction in urban settings. The successful consultant will create a comprehensive transit efficiency plan with clear KPIs for carbon reduction. The $350K budget covers analysis, stakeholder consultation, and implementation roadmap delivery within 6 months. The November 30, 2023 deadline requires immediate attention.'
  },
  {
    id: 'T-2023-003',
    title: 'Elementary School Construction Project',
    description: 'Complete construction of a new elementary school including classrooms, administrative offices, gymnasium, and outdoor recreational facilities. Building must meet green certification standards.',
    submitOn: '2023-10-15',
    lots: 5,
    organisation: 'Department of Education',
    budget: 7500000,
    location: 'Queensland',
    contractType: 'Construction',
    category: 'Education',
    status: 'Closed',
    updatedOn: '2023-08-01',
    aiSummary: 'This construction tender for a new elementary school requires experience with educational facilities and green building certifications. The 5-lot structure spans 7,500 sqm with specialized areas for different educational functions. With a $7.5M budget, the project demands precise cost management. Though the deadline has passed, this represents similar opportunities that may arise in the education sector.'
  },
  {
    id: 'T-2023-004',
    title: 'Cybersecurity Audit and Enhancement',
    description: 'Comprehensive cybersecurity audit of government information systems followed by recommended enhancements to protect against emerging threats.',
    submitOn: '2023-11-10',
    lots: 2,
    organisation: 'Department of Digital Infrastructure',
    budget: 500000,
    location: 'Australian Capital Territory',
    contractType: 'Services',
    category: 'IT & Cybersecurity',
    status: 'Open',
    updatedOn: '2023-09-28',
    aiSummary: 'This cybersecurity tender involves both auditing and enhancement of government information systems. The two-lot approach separates assessment from implementation, with specific requirements for personnel security clearances. The $500K budget covers vulnerability testing, threat modeling, and remediation solutions. With a November 10, 2023 deadline, vendors need demonstrable experience in government security frameworks.'
  },
  {
    id: 'T-2023-005',
    title: 'Waste Management System Modernization',
    description: 'Upgrading the city\'s waste management system with smart technology for optimized collection routes, fill-level monitoring, and overall efficiency improvement.',
    submitOn: '2024-01-20',
    lots: 1,
    organisation: 'City Council',
    budget: 900000,
    location: 'South Australia',
    contractType: 'Supply & Services',
    category: 'Environment',
    status: 'Open',
    updatedOn: '2023-10-05',
    aiSummary: 'This tender focuses on modernizing urban waste management through IoT and smart routing technologies. Requirements include real-time monitoring capabilities, route optimization algorithms, and integration with existing city management systems. The $900K budget covers both hardware and software components with a 5-year support commitment. The January 20, 2024 deadline allows for thorough proposal development.'
  },
  {
    id: 'T-2023-006',
    title: 'Public Housing Renovation Program',
    description: 'Renovation of 50 public housing units to improve energy efficiency, accessibility, and overall living conditions for residents.',
    submitOn: '2023-12-01',
    lots: 2,
    organisation: 'Housing Department',
    budget: 2500000,
    location: 'Western Australia',
    contractType: 'Construction',
    category: 'Housing',
    status: 'Open',
    updatedOn: '2023-09-10',
    aiSummary: 'This renovation tender targets 50 public housing units with dual focus on energy efficiency and accessibility improvements. The two-lot structure divides properties geographically for potentially separate contractors. With a $2.5M budget, cost-effective solutions that maintain quality are essential. The December 1, 2023 deadline requires demonstrated experience in occupied renovation projects with minimal resident disruption.'
  },
  {
    id: 'T-2023-007',
    title: 'Emergency Services Communication Equipment',
    description: 'Supply of advanced communication equipment for emergency services including police, fire, and ambulance to ensure seamless coordination during critical incidents.',
    submitOn: '2023-11-15',
    lots: 3,
    organisation: 'Emergency Services Authority',
    budget: 1800000,
    location: 'Tasmania',
    contractType: 'Supply',
    category: 'Public Safety',
    status: 'Under Review',
    updatedOn: '2023-08-20',
    aiSummary: 'This tender focuses on critical emergency services communication equipment with rigorous requirements for reliability and interoperability. The three-lot structure covers different equipment categories across police, fire, and ambulance services. With a $1.8M budget, proposals must address durability, field testing, and compatibility with existing infrastructure. Currently under review following the November 15, 2023 deadline.'
  },
  {
    id: 'T-2023-008',
    title: 'Renewable Energy Implementation for Government Buildings',
    description: 'Installation of solar panels and other renewable energy solutions for government buildings to reduce carbon footprint and energy costs.',
    submitOn: '2023-12-20',
    lots: 4,
    organisation: 'Department of Energy and Environment',
    budget: 3200000,
    location: 'Northern Territory',
    contractType: 'Supply & Installation',
    category: 'Energy',
    status: 'Open',
    updatedOn: '2023-10-03',
    aiSummary: 'This renewable energy tender covers 20 government buildings requiring solar installation and potentially other clean energy solutions. The four-lot structure divides properties by building type and location. The $3.2M budget includes both equipment and installation with performance guarantees. The December 20, 2023 deadline requires detailed energy production modeling and ROI projections for each building.'
  },
  {
    id: 'T-2023-009',
    title: 'Water Treatment Facility Expansion',
    description: 'Expansion of the regional water treatment facility to increase capacity by 40% and implement advanced filtration technologies.',
    submitOn: '2023-11-25',
    lots: 2,
    organisation: 'Water Authority',
    budget: 5500000,
    location: 'Victoria',
    contractType: 'Construction',
    category: 'Water & Utilities',
    status: 'Closed',
    updatedOn: '2023-08-15',
    aiSummary: 'This water infrastructure tender involves expanding treatment capacity by 40% while implementing advanced filtration technologies. The two-lot approach separates civil works from specialized treatment equipment. The $5.5M budget requires detailed cost breakdowns and value engineering proposals. Though the November 25, 2023 deadline has passed, this represents similar infrastructure opportunities in the utilities sector.'
  },
  {
    id: 'T-2023-010',
    title: 'Digital Inclusion Program for Remote Communities',
    description: 'Implementation of internet connectivity solutions and digital literacy programs for remote and underserved communities to bridge the digital divide.',
    submitOn: '2024-01-15',
    lots: 3,
    organisation: 'Department of Communications',
    budget: 1200000,
    location: 'Queensland',
    contractType: 'Services',
    category: 'Telecommunications',
    status: 'Open',
    updatedOn: '2023-10-10',
    aiSummary: 'This digital inclusion tender targets remote communities with both infrastructure and education components. The three-lot structure covers hardware deployment, connectivity services, and digital literacy training. The $1.2M budget prioritizes sustainable solutions with community engagement. The January 15, 2024 deadline requires demonstrated experience with similar remote community projects.'
  }
];

// Available categories for filtering
export const CATEGORIES = [
  'Healthcare',
  'Transportation',
  'Education',
  'IT & Cybersecurity',
  'Environment',
  'Housing',
  'Public Safety',
  'Energy',
  'Water & Utilities',
  'Telecommunications'
];

// Available locations (states) for filtering
export const LOCATIONS = [
  'New South Wales',
  'Victoria',
  'Queensland',
  'Western Australia',
  'South Australia',
  'Tasmania',
  'Northern Territory',
  'Australian Capital Territory'
];

// Available statuses for filtering
export const STATUSES = ['Open', 'Closed', 'Under Review', 'Awarded'];
