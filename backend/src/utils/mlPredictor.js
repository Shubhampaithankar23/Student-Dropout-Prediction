/**
 * ML Prediction Engine - Random Forest Classifier Simulation
 * In production, this would connect to a Python ML service
 * This implements the prediction logic in JavaScript for demonstration
 */

const predictDropoutRisk = (studentData) => {
  const {
    attendancePercentage,
    cgpa,
    assignmentSubmissionRate,
    lmsActivityScore,
    internalMarks,
    backlogs,
    participationScore,
    financialStatus,
  } = studentData;

  // Feature weights based on Random Forest importance scores
  const weights = {
    cgpa: 0.25,
    attendancePercentage: 0.20,
    backlogs: 0.15,
    assignmentSubmissionRate: 0.12,
    internalMarks: 0.10,
    lmsActivityScore: 0.08,
    financialStatus: 0.06,
    participationScore: 0.04,
  };

  // Normalize features to 0-1 scale (risk contribution)
  const normalizedFeatures = {
    cgpa: Math.max(0, (10 - cgpa) / 10),
    attendancePercentage: Math.max(0, (100 - attendancePercentage) / 100),
    backlogs: Math.min(1, backlogs / 10),
    assignmentSubmissionRate: Math.max(0, (100 - assignmentSubmissionRate) / 100),
    internalMarks: Math.max(0, (100 - internalMarks) / 100),
    lmsActivityScore: Math.max(0, (100 - lmsActivityScore) / 100),
    financialStatus: financialStatus === 'Poor' ? 1 : financialStatus === 'Average' ? 0.5 : 0,
    participationScore: Math.max(0, (100 - participationScore) / 100),
  };

  // Calculate weighted risk score
  let riskScore = 0;
  for (const [feature, weight] of Object.entries(weights)) {
    riskScore += normalizedFeatures[feature] * weight;
  }

  // Clamp score to valid range (no random noise — same input always yields same result)
  riskScore = Math.max(0, Math.min(1, riskScore));

  // Determine risk level
  let riskLevel;
  if (riskScore < 0.35) {
    riskLevel = 'Low';
  } else if (riskScore < 0.65) {
    riskLevel = 'Medium';
  } else {
    riskLevel = 'High';
  }

  // Calculate deterministic confidence based on how far the score is from the nearest boundary
  // Scores near decision boundaries (0.35, 0.65) have lower confidence; clear cases have higher
  const boundaries = [0, 0.35, 0.65, 1];
  const distToBoundary = boundaries.reduce((minDist, b) => Math.min(minDist, Math.abs(riskScore - b)), 1);
  const confidence = Math.min(0.97, 0.70 + distToBoundary * 1.2);

  // Generate factor analysis
  const factors = [];
  
  if (cgpa < 5.0) factors.push({ factor: 'Low CGPA', impact: 'High', value: cgpa, threshold: 5.0 });
  if (attendancePercentage < 60) factors.push({ factor: 'Poor Attendance', impact: 'High', value: attendancePercentage, threshold: 60 });
  if (backlogs > 3) factors.push({ factor: 'Multiple Backlogs', impact: 'High', value: backlogs, threshold: 3 });
  if (assignmentSubmissionRate < 50) factors.push({ factor: 'Low Assignment Submission', impact: 'Medium', value: assignmentSubmissionRate, threshold: 50 });
  if (internalMarks < 40) factors.push({ factor: 'Low Internal Marks', impact: 'Medium', value: internalMarks, threshold: 40 });
  if (lmsActivityScore < 40) factors.push({ factor: 'Low LMS Engagement', impact: 'Medium', value: lmsActivityScore, threshold: 40 });
  if (financialStatus === 'Poor') factors.push({ factor: 'Financial Difficulties', impact: 'Medium', value: financialStatus, threshold: 'Good' });
  if (participationScore < 30) factors.push({ factor: 'Low Participation', impact: 'Low', value: participationScore, threshold: 30 });

  // Generate recommendations
  const recommendations = generateRecommendations(riskLevel, factors);

  return {
    riskScore: parseFloat(riskScore.toFixed(4)),
    riskLevel,
    confidence: parseFloat(confidence.toFixed(4)),
    factors,
    recommendations,
    modelVersion: '2.1.0',
    timestamp: new Date().toISOString(),
  };
};

const generateRecommendations = (riskLevel, factors) => {
  const recommendations = [];
  
  const factorNames = factors.map(f => f.factor);

  if (factorNames.includes('Low CGPA') || factorNames.includes('Low Internal Marks')) {
    recommendations.push('Schedule academic tutoring sessions for weak subjects');
    recommendations.push('Create a personalized study plan with weekly checkpoints');
  }
  if (factorNames.includes('Poor Attendance')) {
    recommendations.push('Investigate reasons for poor attendance through counseling');
    recommendations.push('Connect student with attendance support programs');
  }
  if (factorNames.includes('Multiple Backlogs')) {
    recommendations.push('Prioritize backlog clearance with dedicated faculty support');
    recommendations.push('Create a structured backlog clearance timeline');
  }
  if (factorNames.includes('Low Assignment Submission')) {
    recommendations.push('Check for workload management issues and time management');
    recommendations.push('Assign a mentor for academic accountability');
  }
  if (factorNames.includes('Financial Difficulties')) {
    recommendations.push('Refer to financial aid and scholarship programs');
    recommendations.push('Connect with student welfare committee');
  }
  if (factorNames.includes('Low LMS Engagement')) {
    recommendations.push('Encourage active participation in online learning resources');
    recommendations.push('Set weekly LMS activity goals');
  }

  if (riskLevel === 'High') {
    recommendations.unshift('URGENT: Schedule immediate counseling session');
    recommendations.push('Involve parents/guardians in intervention plan');
    recommendations.push('Monitor student progress weekly');
  } else if (riskLevel === 'Medium') {
    recommendations.unshift('Schedule counseling session within 2 weeks');
    recommendations.push('Monitor student progress bi-weekly');
  } else {
    recommendations.push('Continue regular monitoring and encouragement');
    recommendations.push('Recognize and reward academic achievements');
  }

  return recommendations.slice(0, 6);
};

const batchPredict = (students) => {
  return students.map(student => ({
    studentId: student.id,
    ...predictDropoutRisk(student),
  }));
};

module.exports = { predictDropoutRisk, batchPredict };
