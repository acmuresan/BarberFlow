import nodemailer from "nodemailer";

// Creamos el transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Tipamos los datos de confitmación que extrae de la BD
interface DatosConfirmacion {
  nombre: string;
  email: string;
  barbero_nombre: string;
  servicio_nombre: string;
  fecha_hora: string;
}

// Envía el email de confirmación
export async function enviarConfirmacion(
  datos: DatosConfirmacion,
): Promise<void> {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: datos.email,
    subject: "BarberFlow — Tu cita está confirmada",
    // HTML básico sin frameworks
    html: `
  <h2>Hola ${datos.nombre}</h2>
  <p>Barbero: ${datos.barbero_nombre}</p>
  <p>Servicio: ${datos.servicio_nombre}</p>
  <p>Fecha: ${datos.fecha_hora}</p>
  <p>Dirección: ${process.env.BARBERIA_DIRECCION}</p>
`,
  });
}
