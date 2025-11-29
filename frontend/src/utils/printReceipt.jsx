// import React, { useState, useEffect } from 'react';
// import qz from 'qz-tray';

// const ReceiptPrinter = () => {
//   const [status, setStatus] = useState('Disconnected');
//   const [error, setError] = useState(null);

//   // 1. Establish connection to the QZ Tray software running on your PC
//   useEffect(() => {
//     // Only connect if not already connected
//     if (!qz.websocket.isActive()) {
//       qz.websocket.connect()
//         .then(() => setStatus('Connected to QZ Tray'))
//         .catch((err) => {
//           setStatus('Connection Failed');
//           setError('Make sure QZ Tray app is running on your PC!');
//           console.error(err);
//         });
//     }
//   }, []);

//   const handlePrint = async () => {
//     try {
//       setError(null);
      
//       // 2. TARGET YOUR PRINTER
//       // REPLACE "Xprinter_Raw" with the EXACT name from your Windows Printers list
//       const printerName = "Xprinter_Raw"; 
      
//       // Find the printer in the OS
//       const config = qz.configs.create(printerName);

//       // 3. DEFINE THE RECEIPT (ESC/POS COMMANDS)
//       // These are hex codes that tell the printer what to do.
//       const data = [
//         '\x1B\x40',          // Init Printer
//         '\x1B\x61\x01',      // Align Center
//         '\x1B\x45\x01',      // Bold On
//         'DEWDROP CAFE\x0A',  // Text + Line Feed
//         '\x1B\x45\x00',      // Bold Off
//         '123 Main St, CDO\x0A',
//         '--------------------------------\x0A',
//         '\x1B\x61\x00',      // Align Left
//         'Qty   Item              Price\x0A',
//         '--------------------------------\x0A',
//         '1     Iced Latte        $150\x0A',
//         '2     Croissant         $120\x0A',
//         '--------------------------------\x0A',
//         '\x1B\x61\x02',      // Align Right
//         '\x1B\x45\x01',      // Bold On
//         'TOTAL: $270.00\x0A',
//         '\x1B\x45\x00',      // Bold Off
//         '--------------------------------\x0A',
//         '\x1B\x61\x01',      // Align Center
//         'Thank you!\x0A',
//         '\x0A\x0A\x0A\x0A',  // Feed 4 lines (to clear the cutter)
//         '\x1D\x56\x42\x00'   // Cut Paper (Full Cut)
//       ];

//       // 4. SEND TO PRINTER
//       await qz.print(config, data);
//       alert("Printed Successfully!");

//     } catch (err) {
//       console.error(err);
//       setError(err.message);
//     }
//   };

//   return (
//     <div style={{ border: '1px solid #ccc', padding: '20px', maxWidth: '400px' }}>
//       <h2>Printer Manager</h2>
      
//       <div style={{ marginBottom: '10px' }}>
//         <strong>Status: </strong> 
//         <span style={{ color: status.includes('Connected') ? 'green' : 'red' }}>
//           {status}
//         </span>
//       </div>

//       {error && (
//         <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', marginBottom: '10px' }}>
//           Error: {error}
//         </div>
//       )}

//       <button 
//         onClick={handlePrint} 
//         disabled={!status.includes('Connected')}
//         style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px'}}
//       >
//         Print Test Receipt
//       </button>
//     </div>
//   );
// };

// export default ReceiptPrinter;