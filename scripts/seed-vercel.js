const https = require('https');

// API Base URL
const API_BASE = 'https://talent-job.vercel.app';

// Test users data
const employees = [
  {
    userType: "employee",
    email: "ahmed.dev@example.com",
    password: "password123",
    firstName: "Ahmed",
    lastName: "Mohammed",
    username: "ahmed_dev",
    gender: "male",
    age: 28,
    jobInfo: {
      jobTitle: "Senior Software Developer",
      skills: ["JavaScript", "React", "Node.js", "MongoDB", "TypeScript"],
      experienceDescription: "Full-stack development with 5 years experience in modern web technologies",
      experienceLevel: "senior",
      yearsOfExperience: 5,
      educationalStatus: "Bachelor in Computer Science"
    }
  },
  {
    userType: "employee",
    email: "sara.designer@example.com",
    password: "password123",
    firstName: "Sara",
    lastName: "Ali",
    username: "sara_designer",
    gender: "female",
    age: 25,
    jobInfo: {
      jobTitle: "UI/UX Designer",
      skills: ["Figma", "Adobe XD", "Photoshop", "Illustrator", "Prototyping"],
      experienceDescription: "Creative designer with expertise in user experience and interface design",
      experienceLevel: "mid",
      yearsOfExperience: 3,
      educationalStatus: "Bachelor in Design"
    }
  },
  {
    userType: "employee",
    email: "omar.qa@example.com",
    password: "password123",
    firstName: "Omar",
    lastName: "Hassan",
    username: "omar_qa",
    gender: "male",
    age: 30,
    jobInfo: {
      jobTitle: "QA Engineer",
      skills: ["Selenium", "Jest", "Cypress", "Postman", "Manual Testing"],
      experienceDescription: "Quality assurance specialist with expertise in automated and manual testing",
      experienceLevel: "senior",
      yearsOfExperience: 4,
      educationalStatus: "Bachelor in Software Engineering"
    }
  },
  {
    userType: "employee",
    email: "fatima.data@example.com",
    password: "password123",
    firstName: "Fatima",
    lastName: "Khalil",
    username: "fatima_data",
    gender: "female",
    age: 27,
    jobInfo: {
      jobTitle: "Data Analyst",
      skills: ["Python", "SQL", "Tableau", "Power BI", "Excel"],
      experienceDescription: "Data analysis and visualization expert with strong analytical skills",
      experienceLevel: "mid",
      yearsOfExperience: 3,
      educationalStatus: "Master in Data Science"
    }
  },
  {
    userType: "employee",
    email: "khalid.mobile@example.com",
    password: "password123",
    firstName: "Khalid",
    lastName: "Rashid",
    username: "khalid_mobile",
    gender: "male",
    age: 26,
    jobInfo: {
      jobTitle: "Mobile App Developer",
      skills: ["React Native", "Flutter", "iOS", "Android", "Firebase"],
      experienceDescription: "Mobile development specialist with cross-platform app experience",
      experienceLevel: "mid",
      yearsOfExperience: 3,
      educationalStatus: "Bachelor in Computer Engineering"
    }
  }
];

const employers = [
  {
    userType: "employer",
    email: "ceo@techcorp.com",
    password: "password123",
    companyName: "TechCorp Solutions",
    phoneNumber: "+971501234567",
    details: {
      industry: "Technology",
      contactName: "Mohammed Al-Rashid",
      contactPosition: "CEO"
    }
  },
  {
    userType: "employer",
    email: "owner@designstudio.com",
    password: "password123",
    companyName: "Creative Design Studio",
    phoneNumber: "+971502345678",
    details: {
      industry: "Design",
      contactName: "Layla Al-Zahra",
      contactPosition: "Owner"
    }
  },
  {
    userType: "employer",
    email: "founder@startup.com",
    password: "password123",
    companyName: "Innovation Startup",
    phoneNumber: "+971503456789",
    details: {
      industry: "Technology",
      contactName: "Ahmed Al-Mansouri",
      contactPosition: "Founder"
    }
  },
  {
    userType: "employer",
    email: "director@consulting.com",
    password: "password123",
    companyName: "Strategic Consulting Group",
    phoneNumber: "+966504567890",
    details: {
      industry: "Consulting",
      contactName: "Noor Al-Sabah",
      contactPosition: "Director"
    }
  },
  {
    userType: "employer",
    email: "manager@finance.com",
    password: "password123",
    companyName: "Gulf Finance Services",
    phoneNumber: "+974505678901",
    details: {
      industry: "Finance",
      contactName: "Abdullah Al-Qahtani",
      contactPosition: "Manager"
    }
  }
];

// Helper function to make HTTP requests
function makeRequest(url, method, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'talent-job.vercel.app',
      port: 443,
      path: url.replace('https://talent-job.vercel.app', ''),
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js Seed Script'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Seed function
async function seedVercelDatabase() {
  console.log("🚀 Starting Vercel database seeding...");
  console.log("📊 API Base URL:", API_BASE);

  let successCount = 0;
  let errorCount = 0;

  // Test API connection first
  try {
    console.log("🔍 Testing API connection...");
    const healthCheck = await makeRequest(`${API_BASE}/health`, 'GET');
    console.log("✅ API is accessible:", healthCheck.data);
  } catch (error) {
    console.error("❌ API connection failed:", error.message);
    return;
  }

  // Register employees
  console.log("\n👥 Registering employees...");
  for (const employee of employees) {
    try {
      console.log(`📝 Registering: ${employee.email}`);
      const response = await makeRequest(`${API_BASE}/api/auth/register`, 'POST', employee);
      
      if (response.statusCode === 201) {
        console.log(`✅ Successfully registered: ${employee.email}`);
        successCount++;
      } else {
        console.log(`⚠️  Registration response:`, response.data);
        if (response.data.message === "User already exists") {
          console.log(`✅ User already exists: ${employee.email}`);
          successCount++;
        } else {
          console.log(`❌ Failed to register: ${employee.email}`);
          errorCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Error registering ${employee.email}:`, error.message);
      errorCount++;
    }
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Register employers
  console.log("\n🏢 Registering employers...");
  for (const employer of employers) {
    try {
      console.log(`📝 Registering: ${employer.email}`);
      const response = await makeRequest(`${API_BASE}/api/auth/register`, 'POST', employer);
      
      if (response.statusCode === 201) {
        console.log(`✅ Successfully registered: ${employer.email}`);
        successCount++;
      } else {
        console.log(`⚠️  Registration response:`, response.data);
        if (response.data.message === "User already exists") {
          console.log(`✅ User already exists: ${employer.email}`);
          successCount++;
        } else {
          console.log(`❌ Failed to register: ${employer.email}`);
          errorCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Error registering ${employer.email}:`, error.message);
      errorCount++;
    }
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Test login for one user
  console.log("\n🔐 Testing login...");
  try {
    const loginTest = await makeRequest(`${API_BASE}/api/auth/login`, 'POST', {
      email: 'ahmed.dev@example.com',
      password: 'password123'
    });
    
    if (loginTest.statusCode === 200) {
      console.log("✅ Login test successful!");
    } else {
      console.log("❌ Login test failed:", loginTest.data);
    }
  } catch (error) {
    console.error("❌ Login test error:", error.message);
  }

  console.log("\n📊 Seeding Summary:");
  console.log(`✅ Successful registrations: ${successCount}`);
  console.log(`❌ Failed registrations: ${errorCount}`);
  console.log(`📈 Total users available: ${successCount}`);
  
  console.log("\n🎉 Vercel database seeding completed!");
}

// Run the seeding
seedVercelDatabase().catch(console.error); 