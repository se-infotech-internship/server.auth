"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Register new user
exports.registerNewUser = async () => {
    // const { email, password, userName } = req.body;
    try {
        // Check if User Exists in DB
        //   const emailExist = await User.findOne({ email: req.body.email });
        //   if (emailExist) {
        // res.status(400).json({ message: 'Email is already exists' });
        //     return;
        //   }
        //   const isAdmin = !!req.body.isAdmin;
        //   const newUser = new User({ email, password, userName, isAdmin });
        //   // Hash password
        //   const salt = await bcrypt.genSalt(10);
        //   newUser.password = await bcrypt.hash(req.body.password, salt);
        //   await newUser.save(() => res.status(200).json(newUser));
    }
    catch (err) {
        console.log(err);
    }
};
// Login
exports.userLogIn = async () => {
    try {
        //   const user = await User.findOne({ email: req.body.email });
        //   if (user === null || user.length === 0) {
        //     res.status(400).json('Wrong credentials, try again');
        //     return;
        //   }
        //   else {
        //     // Match password
        //     await bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
        //       if (err) {
        //         console.log(err);
        //         res.status(400).json('Error: ' + err);
        //         return err;
        //       }
        //       if (isMatch) {
        //         user.isAuthenticated = true;
        //         const token = jwt.sign(
        //           { userId: user._id },
        //           process.env.JWT_SECRET,
        //           { expiresIn: '1h' }
        //         );
        //         user.save(() => {
        //           res.json({
        //             userId: user._id,
        //             token: token,
        //             isAdmin: user.isAdmin
        //           });
        //         });
        //       }
        //       else {
        //         console.log('Wrong credentials, try again...');
        //       }
        //     });
        //   }
    }
    catch (err) {
        console.log(err);
    }
};
// Logout
exports.userlogOut = async () => {
    try {
        // logOut user...
    }
    catch (err) {
        console.log(err);
    }
};
