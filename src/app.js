const express = require('express')
const connectDB = require('./config/db.js');
const authRoutes = require('./routes/auth.routes.js');
const userRoutes = require('./routes/user.routes.js');
const recordRoutes = require('./routes/record.routes.js');
const dashboardRoutes = require('./routes/dashboard.routes.js');
const { globalLimiter, authLimiter } = require('./middleware/rateLimiter');
const morgan  = require('morgan');
const helmet  = require('helmet');
const swaggerUi    = require('swagger-ui-express');
const swaggerSpec  = require('./config/swagger');

connectDB()

const app = express()

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json());
app.use(globalLimiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Finance API Docs',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

app.use('/api/auth',authLimiter,authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/records',recordRoutes);
app.use('/api/dashboard', dashboardRoutes);


app.use((req,res) => {
    res.status(404).json({success:false,message:'Route Not found'});
});

app.use((err,req,res,next) =>{
    console.log(err.stack);
    res.status(err.status || 500).json({
        success:false,
        message:err.message || 'Internal server error',
    });
});

module.exports = app;
