const express = require("express");
const app = express();
const port = 8000;
const path = require("path");
const mysql = require("mysql2");
const { v4: uuidv4 } = require("uuid");
const { count } = require("console");
const methodOverride = require("method-override");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const connection = mysql.createConnection({
  host: 'sql311.infinityfree.com', // Replace with your DB host (e.g., sql123.epizy.com)
  user: 'if0_37939467',     // Replace with your DB username
  password: '9lxcgJ59giIKZVA', // Replace with your DB password
  database: 'instaserver_db', // Replace with your DB name
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to InfinityFree MySQL database');
});

//landing page
app.get("/ig", (req, res) => {
  let q = `SELECT count(*) FROM instadata`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["count(*)"];
      console.log("Home route accessed")
      res.render("home", { count });
    });
  } catch (err) {
    console.log("some error in DB");
  }
});

//account creating route
app.get("/ig/create", (req, res) => {
  let newID = uuidv4();
  console.log(`New ID generated: ${newID}`)
  res.render("new.ejs", { newID });
});

app.post("/ig/:id/new", (req, res) => {
  let { id } = req.params;
  let { username, name, email, password, age } = req.body;

  let q = `INSERT INTO instadata VALUES ('${id}', '${name}', '${age}', '${username}', '${email}', '${password}', 0, 0)`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log(`New user('${username}') created with id: '${id}'`);
      res.redirect("/ig/users");
    });
  } catch (err) {
    console.log("error", err);
  }
});

//view users route
app.get("/ig/users", (req, res) => {
  let q = `SELECT * FROM instadata`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let users = result;
      res.render("user.ejs", { users });
    });
  } catch (err) {
    console.log("some error in Database");
  }
});

//view user data
app.get("/ig/:id/view", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM instadata WHERE id = '${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("view.ejs", { user });
    });
  } catch (err) {
    console.log("Some error on Instagram Database");
  }
});

//delete user
app.get("/ig/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM instadata WHERE id = '${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      console.log(`User ${user.username} was initiate delete request.`);
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    console.log("Error");
  }
});

app.patch("/ig/:id/delete", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;

  let q = `SELECT * FROM instadata WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (password != user.password) {
        res.render("wrong.ejs", { message: "Incorrect password" });
      } else {
        
        console.log(
          `User: ${user.username}'s password matched with database\nDeleting User...`
        );
        q = `DELETE FROM instadata WHERE id = '${id}'`;
        try {
          connection.query(q, (err, result) => {
            if (err) throw err;
            console.log(`{ ${user.username} }- User Deleted`);

            res.redirect("/ig/users");
          });
        } catch (err) {
          console.log("error");
        }
      }
    });
  } catch (err) {
    console.log("err");
  }
});

//updating data
app.get("/ig/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM instadata WHERE id = '${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log("error");
  }
});

app.patch("/ig/:id/edit", (req, res) => {
  let { id } = req.params;
  let { password, newemail, newname } = req.body;

  let q = `SELECT * FROM instadata WHERE id = '${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (password != user.password) {
        res.render("wrong.ejs", { message: "Incorrect password" });
      } else {
        if (newemail.length > 1) {
          q = `UPDATE instadata SET email = '${newemail}' WHERE id = '${id}'`;
          try {
            connection.query(q, (err, result) => {
              if (err) throw err;
              console.log(
                `'${user.username}' updated their email to '${newemail}'`
              );
              res.redirect("/ig/users");
            });
          } catch (err) {
            console.log("Error");
          }
        } else if (newname.length > 1) {
          q = `UPDATE instadata SET name = '${newname}' WHERE id = '${id}'`;
          try {
            connection.query(q, (err, result) => {
              if (err) throw err;
              console.log(
                `'${user.username}' updated their name to '${newname}'`
              );
              res.redirect("/ig/users");
            });
          } catch (err) {
            console.log("Error");
          }
        } else {
          res.render("wrong.ejs", { message: "Nothing Changed" });
        }
      }
    });
  } catch (err) {
    console.log("Error");
  }
});

app.get("/ig/:id/reset", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM instadata WHERE id = '${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;

      let user = result[0];
      res.render("reset.ejs", { user });
    });
  } catch (err) {
    console.log("Error");
  }
});

app.patch("/ig/:id/reset", (req, res) => {
  let { id } = req.params;
  let { oldpassword, newpassword } = req.body;

  let q = `SELECT password, username FROM instadata WHERE id = '${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (oldpassword != user.password) {
        res.render("wrong.ejs", { message: "Incorrect Old password" });
      } else {
        q = `UPDATE instadata SET password = '${newpassword}' WHERE id = '${id}'`;
        try {
          connection.query(q, (err, result) => {
            if (err) throw err;
            console.log(`${user.username} reset their password.`);
            res.redirect("/ig/users");
          });
        } catch (error) {
          console.log("Error");
        }
      }
    });
  } catch (error) {
    console.log("Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
