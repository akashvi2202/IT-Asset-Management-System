const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const multer = require('multer');
const app = express();
const port = 3000;

const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'data'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

app.post('/insert', (req, res) => {
    console.log('Received data:', req.body);  // Log received data for debugging

    const category = req.body.category;
    let query = '';
    let values = [];

    const getValue = (value) => value === '' ? null : value;

    switch (req.body.category) {
        case 'attendance':
            query = 'INSERT INTO attendancemachine (Make, Model, Location, IP, Mac_Address, Serial_Number) VALUES (?, ?, ?, ?, ?, ?)';
            values = [req.body.make, req.body.model, req.body.location, req.body.ip, req.body.mac_address, req.body.serial_number];
            break;
        case 'video':
            query = 'INSERT INTO vc (Make, Model, IP, Mac_Address, Serial_Number) VALUES (?, ?, ?, ?, ?)';
            values = [req.body.make, req.body.model, req.body.ip, req.body.mac_address, req.body.serial_number];
            break;
        case 'desktop':
            query = 'INSERT INTO desktopcsv (EMP_ID, USER_NAME, HOSTNAME, IP_ADDRESS, MAC_ADDRESS, SERIAL_NO, MAKE, SYSTEM_MODEL, PROCESSOR, WINDOWS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            values = [getValue(req.body.emp_id), req.body.user_name, req.body.hostname, req.body.ip_address, req.body.mac_address, req.body.serial_no, req.body.make, req.body.system_model, req.body.processor, req.body.windows];
            break;
        case 'printer':
            query = 'INSERT INTO printercsvfile (SUBSTATION,MAKE, MODEL_NO) VALUES (?,?, ?)';
            values = [req.body.substation,req.body.make, req.body.model_no];
            break;
        case 'router':
            query = 'INSERT INTO router_switch (ASSET,MAKE, MODEL_NO, SERIALNO, WAN_IP_ROUTER) VALUES (?, ?, ?, ?,?)';
            values = ['ROUTER',req.body.make, req.body.model_no, req.body.serialno, req.body.wan_ip_router];
            break;
        case 'switch':
            query = 'INSERT INTO router_switch (ASSET,MAKE, MODEL_NO, SERIALNO, SWITCH_IP_SWITCH) VALUES (?,?, ?, ?, ?)';
            values = ['SWITCH',req.body.asset,req.body.make, req.body.model_no, req.body.serialno, req.body.switch_ip_switch];
            break;
        case 'sitco':
            query = 'INSERT INTO substations (SUBSTATION, SITCO_NAME, SITCO_EMP_ID, SITCO_MOBILE_NO, SITCO_DESIGNATION, SITCO_MAIL_ID) VALUES (?, ?, ?, ?, ?, ?)';
            values = [req.body.substation, req.body.sitco_name, req.body.sitco_emp_id, req.body.sitco_mobile_no, req.body.sitco_designation, req.body.sitco_mail_id];
            break;
        case 'hod':
            query = 'INSERT INTO substations (SUBSTATION, SITCO_NAME, HOD_EMP_ID, HOD_MOBILE_NO, HOD_DESIGNATION, HOD_MAIL_ID) VALUES (?, ?, ?, ?, ?, ?)';
            values = [req.body.substation, req.body.sitco_name, req.body.hod_emp_id, req.body.hod_mobile_no, req.body.hod_designation, req.body.hod_mail_id];
            break;
        case 'internal_auditor':
            query = 'INSERT INTO substations (INTERNAL_AUDITOR_NAME, INTERNAL_AUDITOR_EMP_ID, INTERNAL_AUDITOR_MOBILE_NO, INTERNAL_AUDITOR_DESIGNATION, INTERNAL_AUDITOR_MAIL_ID) VALUES (?, ?, ?, ?, ?)';
            values = [req.body.internal_auditor_name, req.body.internal_auditor_emp_id, req.body.internal_auditor_mobile_no, req.body.internal_auditor_designation, req.body.internal_auditor_mail_id];
            break;
        case 'substation':
            query = 'INSERT INTO substations (SUBSTATION, SITCO_NAME, SITCO_EMP_ID, SITCO_MOBILE_NO, SITCO_DESIGNATION, SITCO_MAIL_ID, HOD_NAME, HOD_EMP_ID, HOD_MOBILE_NO, HOD_DESIGNATION, HOD_MAIL_ID, INTERNAL_AUDITOR_NAME, INTERNAL_AUDITOR_EMP_ID, INTERNAL_AUDITOR_MOBILE_NO, INTERNAL_AUDITOR_DESIGNATION, INTERNAL_AUDITOR_MAIL_ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            values = [
                req.body.substation,
                req.body.sitco_name,
                getValue(req.body.sitco_emp_id),
                getValue(req.body.sitco_mobile_no),
                req.body.sitco_designation,
                req.body.sitco_mail_id,
                req.body.hod_name,
                getValue(req.body.hod_emp_id),
                getValue(req.body.hod_mobile_no),
                req.body.hod_designation,
                req.body.hod_mail_id,
                req.body.internal_auditor_name,
                getValue(req.body.internal_auditor_emp_id),
                getValue(req.body.internal_auditor_mobile_no),
                req.body.internal_auditor_designation,
                req.body.internal_auditor_mail_id
            ];
            break;
        default:
            return res.status(400).json({ message: 'Invalid category selected' });
    }

    console.log('Executing query:', query, 'with values:', values);
    connection.query(query, values, (error, results, fields) => {
        if (error) {
            console.error("Error executing query:", error);
            // Handle error appropriately
        } else {
            console.log("Data inserted successfully:", results);
            // Handle success scenario
        }
    });


    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).json({ message: 'Error adding data', error });
        }
        connection.commit((err) => {
            if (err) {
                console.error('Error committing transaction:', err);
                return res.status(500).json({ message: 'Error committing transaction', err });
            }
            console.log('Transaction committed');
            res.json({ message: 'Data added successfully' });
        });
    });
    

});

// Handle search operation
app.post('/search', (req, res) => {
    const category = req.body.category;
    let query = '';

    switch (req.body.category) {
        case 'attendance':
            query = 'SELECT id, Make, Model, Location, IP, Mac_Address, Serial_Number FROM attendancemachine';
            break;
        case 'video':
            query = 'SELECT id, Make, Model, IP, Mac_Address, Serial_Number FROM vc';
            break;
        case 'desktop':
            query = 'SELECT id, EMP_ID, USER_NAME, HOSTNAME, IP_ADDRESS, MAC_ADDRESS, SERIAL_NO, MAKE, SYSTEM_MODEL, PROCESSOR, WINDOWS FROM desktopcsv';
            break;
        case 'printer':
            query = 'SELECT id,Substation, MAKE, MODEL_NO FROM printercsvfile';
            break;
        case 'router':
            query = 'SELECT id, MAKE, MODEL_NO, SERIALNO, WAN_IP_ROUTER FROM router_switch WHERE TRIM(ASSET) = "ROUTER"';
            break;
        case 'switch':
            query = 'SELECT id, MAKE, MODEL_NO, SERIALNO, SWITCH_IP_SWITCH FROM router_switch WHERE TRIM(ASSET) = "SWITCH"';
            break;
                
        case 'sitco':
            query = 'SELECT id, SUBSTATION, SITCO_NAME, SITCO_EMP_ID, SITCO_MOBILE_NO, SITCO_DESIGNATION, SITCO_MAIL_ID FROM substations';
            break;
        case 'hod':
            query = 'SELECT id, SUBSTATION, HOD_NAME, HOD_EMP_ID, HOD_MOBILE_NO, HOD_DESIGNATION, HOD_MAIL_ID FROM substations';
            break;
        case 'internal_auditor':
            query = 'SELECT id, SUBSTATION, INTERNAL_AUDITOR_NAME, INTERNAL_AUDITOR_EMP_ID, INTERNAL_AUDITOR_MOBILE_NO, INTERNAL_AUDITOR_DESIGNATION, INTERNAL_AUDITOR_MAIL_ID FROM substations';
            break;
        case 'substation':
            query = 'SELECT id, SUBSTATION, SITCO_NAME, SITCO_EMP_ID, SITCO_MOBILE_NO, SITCO_DESIGNATION, SITCO_MAIL_ID, HOD_NAME, HOD_EMP_ID, HOD_MOBILE_NO, HOD_DESIGNATION, HOD_MAIL_ID, INTERNAL_AUDITOR_NAME, INTERNAL_AUDITOR_EMP_ID, INTERNAL_AUDITOR_MOBILE_NO, INTERNAL_AUDITOR_DESIGNATION, INTERNAL_AUDITOR_MAIL_ID FROM substations';
            break;
        default:
            res.status(400).send('Invalid category');
            return;
    }

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error fetching data');
        } else {
            res.json(results);
        }
    });
});

    

// Handle delete operation
app.post('/delete', (req, res) => {
    const id = req.body.id; // Assuming 'id' is passed from the frontend
    const category = req.body.category;
    let query = '';

    switch (category) {
        case 'attendance':
            query = 'DELETE FROM attendancemachine WHERE id = ?';
            break;
        case 'video':
            query = 'DELETE FROM vc WHERE id = ?';
            break;
        case 'desktop':
            query = 'DELETE FROM desktopcsv WHERE id = ?';
            break;
        case 'printer':
            query = 'DELETE FROM printercsvfile WHERE id = ?';
            break;
        case 'router':
        case 'switch':
            query = 'DELETE FROM router_switch WHERE id = ?';
            break;
        case 'sitco':
        case 'hod':
        case 'internal_auditor':
        case 'substation':
            query = 'DELETE FROM substations WHERE id = ?';
            break;
        default:
            return res.status(400).json({ message: 'Invalid category selected' });
    }

    connection.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error deleting data:', error);
            return res.status(500).json({ message: 'Error deleting data', error });
        }
        res.json({ message: 'Data deleted successfully' });
    });
});

// Handle update operation
app.post('/update', (req, res) => {
    const id = req.body.id;
    const category = req.body.category;
    const updatedData = req.body.updatedData;
    let query = '';
    let values = [];

    // Logging the incoming data for debugging
    console.log('Update request received:', { id, category, updatedData });

    switch (category) {
        case 'attendance':
            query = 'UPDATE attendancemachine SET Make=?, Model=?, Location=?, IP=?, Mac_Address=?, Serial_Number=? WHERE id=?';
            values = [updatedData.make, updatedData.model, updatedData.location, updatedData.ip, updatedData.mac_address, updatedData.serial_number, id];
            break;
        case 'video':
            query = 'UPDATE vc SET Make=?, Model=?, IP=?, Mac_Address=?, Serial_Number=? WHERE id=?';
            values = [updatedData.make, updatedData.model, updatedData.ip, updatedData.mac_address, updatedData.serial_number, id];
            break;
        case 'desktop':
            query = 'UPDATE desktopcsv SET EMP_ID=?, USER_NAME=?, HOSTNAME=?, IP_ADDRESS=?, MAC_ADDRESS=?, SERIAL_NO=?, MAKE=?, SYSTEM_MODEL=?, PROCESSOR=?, WINDOWS=? WHERE id=?';
            values = [updatedData.emp_id, updatedData.user_name, updatedData.hostname, updatedData.ip_address, updatedData.mac_address, updatedData.serial_no, updatedData.make, updatedData.system_model, updatedData.processor, updatedData.windows, id];
            break;
        case 'printer':
            query = 'UPDATE printercsvfile SET SUBSTATION=?,MAKE=?, MODEL_NO=? WHERE id=?';
            values = [updatedData.substation,updatedData.make, updatedData.model_no, id];
            break;
        case 'router':
                query = 'UPDATE router_switch SET MAKE=?, MODEL_NO=?, SERIALNO=?, WAN_IP_ROUTER=? WHERE id=?';
                values = [updatedData.make, updatedData.model_no, updatedData.serial_no, updatedData.wan_ip_router, id]; // Fixed key: serialno to serial_no
                break;
        case 'switch':
                query = 'UPDATE router_switch SET MAKE=?, MODEL_NO=?, SERIALNO=?, SWITCH_IP_SWITCH=? WHERE id=?';
                values = [updatedData.make, updatedData.model_no, updatedData.serial_no, updatedData.switch_ip_switch, id]; // Fixed key: serialno to serial_no
                break;
        case 'sitco':
                    query = 'UPDATE substations SET SUBSTATION=?, SITCO_NAME=?, SITCO_EMP_ID=?, SITCO_MOBILE_NO=?, SITCO_DESIGNATION=?, SITCO_MAIL_ID=? WHERE id=?';
                    values = [updatedData.substation, updatedData.sitco_name, updatedData.sitco_employee_id, updatedData.sitco_mobile_no, updatedData.sitco_designation, updatedData.sitco_mail_id, id];
                    break;
        case 'hod':
                    query = 'UPDATE substations SET SUBSTATION=?, HOD_NAME=?, HOD_EMP_ID=?, HOD_MOBILE_NO=?, HOD_DESIGNATION=?, HOD_MAIL_ID=? WHERE id=?';
                    values = [updatedData.substation, updatedData.hod_name, updatedData.hod_employee_id, updatedData.hod_mobile_no, updatedData.hod_designation, updatedData.hod_mail_id, id];
                    break;
        case 'internal_auditor':
                    query = 'UPDATE substations SET SUBSTATION=?, INTERNAL_AUDITOR_NAME=?, INTERNAL_AUDITOR_EMP_ID=?, INTERNAL_AUDITOR_MOBILE_NO=?, INTERNAL_AUDITOR_DESIGNATION=?, INTERNAL_AUDITOR_MAIL_ID=? WHERE id=?';
                    values = [updatedData.substation, updatedData.internal_auditor_name, updatedData.internal_auditor_employee_id, updatedData.internal_auditor_mobile_no, updatedData.internal_auditor_designation, updatedData.internal_auditor_mail_id, id];
                    break;
        case 'substation':
            query = 'UPDATE substations SET SUBSTATION=?, SITCO_NAME=?, SITCO_EMP_ID=?, SITCO_MOBILE_NO=?, SITCO_DESIGNATION=?, SITCO_MAIL_ID=?, HOD_NAME=?, HOD_EMP_ID=?, HOD_MOBILE_NO=?, HOD_DESIGNATION=?, HOD_MAIL_ID=?, INTERNAL_AUDITOR_NAME=?, INTERNAL_AUDITOR_EMP_ID=?, INTERNAL_AUDITOR_MOBILE_NO=?, INTERNAL_AUDITOR_DESIGNATION=?, INTERNAL_AUDITOR_MAIL_ID=? WHERE id=?';
            values = [
                updatedData.substation, updatedData.sitco_name, updatedData.sitco_employee_id, updatedData.sitco_mobile_no, updatedData.sitco_designation, updatedData.sitco_mail_id, updatedData.hod_name, updatedData.hod_employee_id, updatedData.hod_mobile_no, updatedData.hod_designation, updatedData.hod_mail_id, updatedData.internal_auditor_name, updatedData.internal_auditor_employee_id, updatedData.internal_auditor_mobile_no, updatedData.internal_auditor_designation, updatedData.internal_auditor_mail_id, id
            ];
            break;
        default:
            return res.status(400).json({ message: 'Invalid category selected' });
    }
    console.log('Executing query:', query);
    console.log('With values:', values);

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error updating data:', error);
            return res.status(500).json({ message: 'Error updating data', error });
        }
        res.json({ message: 'Data updated successfully' });
    });
});

app.get('/api/asset-summary', (req, res) => {
    const totalAssetsQuery = 'SELECT COUNT(*) AS totalAssets FROM attendancemachine';
    const topBrandsQuery = 'SELECT Make, COUNT(*) AS count FROM attendancemachine GROUP BY Make ORDER BY count DESC';

    connection.query(totalAssetsQuery, (err, totalResults) => {
        if (err) return res.status(500).json({ error: 'An error occurred while fetching total assets' });

        connection.query(topBrandsQuery, (err, topBrandsResults) => {
            if (err) return res.status(500).json({ error: 'An error occurred while fetching top brands' });

            res.json({
                totalAssets: totalResults[0].totalAssets,
                topBrands: topBrandsResults.map(result => ({ name: result.Make, count: result.count }))
            });
        });
    });
});


// Route to get VC device data
app.get('/api/vc-device-summary', async (req, res) => {
    try {
        // Queries to get the data
        const totalAssetsQuery = 'SELECT COUNT(*) AS totalAssets FROM vc';
        const topBrandsQuery = 'SELECT Make, COUNT(*) AS count FROM vc GROUP BY Make ORDER BY count DESC';
        
        // Fetch total assets
        const totalResults = await new Promise((resolve, reject) => {
            connection.query(totalAssetsQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        const totalAssets = totalResults[0].totalAssets;

        // Fetch top brands
        const topBrandsResults = await new Promise((resolve, reject) => {
            connection.query(topBrandsQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        const topBrands = topBrandsResults.map(result => ({ name: result.Make, count: result.count }));


        // Send the response
        res.json({
            totalAssets,
            topBrands            
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching data' });
    }
});



// Define route to fetch desktop summary
app.get('/api/desktop-summary', (req, res) => {
    const query = 'SELECT * FROM desktopcsv';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).json({ error: 'Error fetching data' });
            return;
        }

        const makes = [];
        const windowsVersions = [];

        results.forEach(row => {
            // Process makes
            const makeIndex = makes.findIndex(m => m.make === row.MAKE);
            if (makeIndex === -1) {
                makes.push({ make: row.MAKE, count: 1 });
            } else {
                makes[makeIndex].count += 1;
            }

            // Process Windows versions
            const windowsIndex = windowsVersions.findIndex(w => w.version === row.WINDOWS);
            if (windowsIndex === -1) {
                windowsVersions.push({ version: row.WINDOWS, count: 1 });
            } else {
                windowsVersions[windowsIndex].count += 1;
            }
        });

        res.json({
            totalDesktops: results.length,
            makes: makes,
            windowsVersions: windowsVersions
        });
    });
});

// API endpoint to get printer summary data
app.get('/api/printer-summary', (req, res) => {
    const query = `
      SELECT Substation, MAKE, COUNT(*) as count
      FROM printercsvfile
      GROUP BY Substation, MAKE;
    `;
  
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }
  
      // Process data
      const substations = [...new Set(results.map(row => row.Substation))];
      const makes = [...new Set(results.map(row => row.MAKE))].map(make => make.trim().toUpperCase()); // Normalize make values
  
      const makeData = makes.map(make => ({
        make,
        substationCounts: substations.map(substation => {
          const match = results.find(row => row.Substation === substation && row.MAKE.trim().toUpperCase() === make);
          return match ? match.count : 0;
        })
      }));
  
      res.json({
        substations,
        makes: makeData
      });
    });
});


  app.get('/data', (req, res) => {
    // Query to get counts for routers
    const sqlRouters = "SELECT MAKE, COUNT(*) as count FROM router_switch WHERE TRIM(ASSET) = 'ROUTER' GROUP BY MAKE";
    connection.query(sqlRouters, (err, routersData) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Query to get counts for switches
        const sqlSwitches = "SELECT MAKE, COUNT(*) as count FROM router_switch WHERE TRIM(ASSET) = 'SWITCH' GROUP BY MAKE";
        connection.query(sqlSwitches, (err, switchesData) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                routers: routersData,
                switches: switchesData
            });
        });
    });
});
// Serve static files (e.g., uploaded PDFs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route to handle form submissions including PDF upload
app.post('/submit', upload.single('pdfFile'), (req, res) => {
    const { gatePassNumber, dateTime, personName, department, employeeNumber, items } = req.body;
    const pdfFileData = req.file ? req.file.buffer : null;
    const itemsJSON = JSON.stringify(JSON.parse(items));

    const query = `
        INSERT INTO gate_pass (gate_pass_number, date_time, person_name, department, employee_number, items, pdf_file)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

    connection.query(query, [gatePassNumber, dateTime, personName, department, employeeNumber, itemsJSON, pdfFileData], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).json({ status: 'error', message: 'Error saving data' });
            return;
        }
        res.json({ status: 'success' });
    });
});

// Route to fetch gate passes
app.get('/gate-passes', (req, res) => {
    const query = 'SELECT  gate_pass_number, date_time, person_name, department, employee_number, items, employee_signature, admin_signature, dgm_signature, pdf_file FROM gate_pass, (SELECT @row_number := 0) AS t ORDER BY date_time DESC';
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching gate pass records:', err);
            res.status(500).json({ status: 'error', message: 'Error fetching records' });
            return;
        }

        results.forEach(record => {
            if (typeof record.items === 'string') {
                try {
                    record.items = JSON.parse(record.items); // Parse JSON string into an object
                } catch (e) {
                    console.error('Error parsing items field:', e);
                    record.items = {}; // Default to an empty object if parsing fails
                }
            }
        });

        res.json(results);
    });
});
// Route to serve PDF files
app.get('/pdf/:gatePassNumber', (req, res) => {
    const gatePassNumber = req.params.gatePassNumber;

    const query = 'SELECT pdf_file FROM gate_pass WHERE gate_pass_number = ?';
    
    connection.query(query, [gatePassNumber], (err, results) => {
        if (err) {
            console.error('Error fetching PDF:', err);
            res.status(500).json({ status: 'error', message: 'Error fetching PDF' });
            return;
        }
        
        if (results.length === 0 || !results[0].pdf_file) {
            return res.status(404).json({ status: 'error', message: 'No PDF found' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.send(results[0].pdf_file);
    });
});

process.on('SIGINT', () => {
    connection.end((err) => {
      if (err) {
        console.error('Error closing MySQL connection:', err);
        return;
      }
      console.log('MySQL connection closed');
      process.exit();
    });
  });

// Start the server
app.listen(port, () => {
    console.log('Server running at http://localhost:${port}');
});
