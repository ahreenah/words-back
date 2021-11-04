import express from 'express';
import path from 'path';
import services from '../services/index.js';

const app = express(); 

const serviceNames = Object.keys(services);
for (let i = 0; i < serviceNames.length; i += 1) {
  const name = serviceNames[i];
  if (name === 'graphql') {
    services[name].applyMiddleware({ app });
  } else {
    app.use(`/${name}`, services[name]);
  }
}

// console.log(path.join('.'))
// const root = path.join(path.dirname(), '../');
// console.log(root)
// import path from 'path';
const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// app.use(
//   function (req, res, next) {
//       console.log('first function');
//       let random = Math.random() * (10 -1) + 1;
//       // console.log(random)
//       // console.log(random>5)
//       if (random > 5) {
//         console.log('next');
//         next();
//         return 
//       }
//       else
//       res.send('Hi World!');
//   })

// app.use('/', express.static('static'));

app.get('/a',function (req, res) {
      console.log('seconds function');
      res.send('Hello World!');
  })
// app.get('/a',
//     );
    
// app.get('*', (req, res) => res.send('Not found!'));

app.listen(8000, () => console.log('Listening on port 8000!'));