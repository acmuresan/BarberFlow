import nodemailer from "nodemailer";

// Creamos el transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Tipamos los datos de confirmación que extrae de la BD
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
  try {
    // Formateamos la fecha en español para que sea legible
    const fecha = new Date(datos.fecha_hora).toLocaleString("es-ES", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Europe/Madrid",
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: datos.email,
      subject: "BarberFlow — Tu cita está confirmada",
      html: `
        <h2>Hola ${datos.nombre}</h2>
        <p>Barbero: ${datos.barbero_nombre}</p>
        <p>Servicio: ${datos.servicio_nombre}</p>
        <p>Fecha: ${fecha}</p>
        <p>Dirección: ${process.env.BARBERIA_DIRECCION}</p>
      `,
    });
    console.log("Email enviado:", info.messageId);
  } catch (error) {
    console.error("Error enviando email:", error);
  }
}
