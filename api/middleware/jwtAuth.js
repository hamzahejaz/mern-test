import jwt from "jsonwebtoken";

function authorize(roles = []) {
	return (req, res, next) => {
		try {
			const authHeader = req.headers.authorization;
			if (!authHeader || !authHeader.startsWith("Bearer ")) {
				return res.status(401).json({ error: "Access token required" });
			}
			const token = authHeader.substring(7);

			if (!token) {
				return res.status(401).json({ error: "Aceess token required" });
			}
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			if (roles.length > 0 && !roles.includes(decoded.role)) {
				return res
					.status(403)
					.json({
						error:
							"Forbidden: You do not have permission to access this resource",
						required: roles,
						current: decoded.role,
					});
			}
			req.user = decoded;
			next();
		} catch (error) {
			if (error.name === "TokenExpiredError") {
				return res.status(401).json({ error: "Access token expired" });
			}
			if (error.name === "JsonWebTokenError") {
				return res.status(401).json({ error: "Invalid access token" });
			}
			console.error("JWT Authorization Error:", error);
			return res.status(500).json({ error: "Internal Server Error" });
		}
	};
}
