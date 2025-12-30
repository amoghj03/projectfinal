import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  School,
  TrendingUp,
  Assignment,
  CheckCircle,
  Schedule,
  Star,
  OpenInNew,
  EmojiEvents,
  BookmarkBorder,
} from '@mui/icons-material';
import { Layout } from './Dashboard';

const SkillManagement = () => {
  const [skills] = useState([
    {
      id: 1,
      name: 'Banking Operations',
      currentScore: 85,
      lastTestDate: '2024-10-15',
      nextTestDate: '2024-12-15',
      progress: 85,
      level: 'Advanced'
    },
    {
      id: 2,
      name: 'Customer Service',
      currentScore: 92,
      lastTestDate: '2024-10-20',
      nextTestDate: '2024-12-20',
      progress: 92,
      level: 'Expert'
    },
    {
      id: 3,
      name: 'Financial Analysis',
      currentScore: 78,
      lastTestDate: '2024-09-25',
      nextTestDate: '2024-11-25',
      progress: 78,
      level: 'Intermediate'
    },
    {
      id: 4,
      name: 'Risk Management',
      currentScore: 0,
      lastTestDate: null,
      nextTestDate: '2024-11-30',
      progress: 0,
      level: 'Not Started'
    }
  ]);

  const [testDialog, setTestDialog] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isTestRunning, setIsTestRunning] = useState(false);

  const achievements = [
    { name: 'Customer Service Excellence', date: '2024-10-20', score: 92 },
    { name: 'Banking Operations Certified', date: '2024-10-15', score: 85 },
    { name: 'First Assessment Complete', date: '2024-09-25', score: 78 }
  ];

  const upcomingTests = skills.filter(skill => {
    const nextTest = new Date(skill.nextTestDate);
    const today = new Date();
    const daysDiff = Math.ceil((nextTest - today) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30 && daysDiff >= 0;
  });

  const getSkillLevel = (score) => {
    if (score >= 90) return { label: 'Expert', color: 'success' };
    if (score >= 80) return { label: 'Advanced', color: 'primary' };
    if (score >= 70) return { label: 'Intermediate', color: 'warning' };
    if (score >= 60) return { label: 'Beginner', color: 'info' };
    return { label: 'Not Started', color: 'default' };
  };

  const getProgressColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 80) return 'primary';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const handleInitiateTest = (skill) => {
    setSelectedSkill(skill);
    setTestDialog(true);
  };

  const startTest = () => {
    setIsTestRunning(true);
    setTestDialog(false);
    
    // Simulate test process
    setTimeout(() => {
      setIsTestRunning(false);
      // In real app, this would redirect to actual test platform
      alert(`Test for ${selectedSkill.name} would open in a new window with your 3rd-party testing platform.`);
    }, 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not taken';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysUntilTest = (dateString) => {
    const testDate = new Date(dateString);
    const today = new Date();
    const daysDiff = Math.ceil((testDate - today) / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  return (
    <Layout>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Skill Management
        </Typography>

        <Grid container spacing={3}>
          {/* Overview Cards */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ backgroundColor: 'primary.main', mr: 2 }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">Average Score</Typography>
                    <Typography variant="h4" color="primary">
                      {Math.round(skills.reduce((acc, skill) => acc + skill.currentScore, 0) / skills.length)}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ backgroundColor: 'success.main', mr: 2 }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">Completed Tests</Typography>
                    <Typography variant="h4" color="success.main">
                      {skills.filter(skill => skill.currentScore > 0).length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ backgroundColor: 'warning.main', mr: 2 }}>
                    <Schedule />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">Upcoming Tests</Typography>
                    <Typography variant="h4" color="warning.main">
                      {upcomingTests.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Skill Assessment Cards */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Your Skills
            </Typography>
            <Grid container spacing={3}>
              {skills.map((skill) => {
                const level = getSkillLevel(skill.currentScore);
                const daysUntilTest = getDaysUntilTest(skill.nextTestDate);
                
                return (
                  <Grid item xs={12} md={6} key={skill.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            {skill.name}
                          </Typography>
                          <Chip 
                            label={level.label} 
                            color={level.color} 
                            size="small"
                          />
                        </Box>

                        {skill.currentScore > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">Current Score</Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {skill.currentScore}%
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={skill.currentScore} 
                              color={getProgressColor(skill.currentScore)}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                        )}

                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            Last Test: {formatDate(skill.lastTestDate)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Next Test: {formatDate(skill.nextTestDate)}
                            {daysUntilTest <= 7 && daysUntilTest >= 0 && (
                              <Chip 
                                label={`${daysUntilTest} days left`} 
                                color="warning" 
                                size="small" 
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Typography>
                        </Box>

                        <Button
                          variant={skill.currentScore === 0 ? 'contained' : 'outlined'}
                          fullWidth
                          startIcon={<Assignment />}
                          onClick={() => handleInitiateTest(skill)}
                          disabled={isTestRunning}
                        >
                          {skill.currentScore === 0 ? 'Take First Test' : 'Retake Test'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>

          {/* Upcoming Tests Reminder */}
          {upcomingTests.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Upcoming Test Reminders
                  </Typography>
                  <List>
                    {upcomingTests.map((skill) => {
                      const daysLeft = getDaysUntilTest(skill.nextTestDate);
                      return (
                        <React.Fragment key={skill.id}>
                          <ListItem>
                            <ListItemIcon>
                              <BookmarkBorder />
                            </ListItemIcon>
                            <ListItemText
                              primary={skill.name}
                              secondary={`Due in ${daysLeft} days - ${formatDate(skill.nextTestDate)}`}
                            />
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      );
                    })}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Recent Achievements */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Recent Achievements
                </Typography>
                <List>
                  {achievements.map((achievement, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <Star color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={achievement.name}
                          secondary={`${formatDate(achievement.date)} - Score: ${achievement.score}%`}
                        />
                      </ListItem>
                      {index < achievements.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Test Initiation Dialog */}
        <Dialog open={testDialog} onClose={() => setTestDialog(false)}>
          <DialogTitle>
            Initiate Skill Test
          </DialogTitle>
          <DialogContent>
            {selectedSkill && (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  You are about to start the skill assessment for <strong>{selectedSkill.name}</strong>.
                </Alert>
                
                <Typography variant="body1" gutterBottom>
                  Test Details:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Duration" 
                      secondary="30-45 minutes" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Format" 
                      secondary="Multiple choice and practical scenarios" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Passing Score" 
                      secondary="70% minimum" 
                    />
                  </ListItem>
                </List>
                
                <Alert severity="warning">
                  Please ensure you have a stable internet connection and uninterrupted time to complete the test.
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTestDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={startTest} 
              variant="contained"
              startIcon={<OpenInNew />}
            >
              Start Test
            </Button>
          </DialogActions>
        </Dialog>

        {/* Loading Overlay */}
        {isTestRunning && (
          <Dialog open={isTestRunning}>
            <DialogContent sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6">
                Initializing Test Platform...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Redirecting you to the assessment portal
              </Typography>
            </DialogContent>
          </Dialog>
        )}
      </Box>
    </Layout>
  );
};

export default SkillManagement;