import { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function LoginForm() {
	const { login, loading, error, isAuthenticated, user } = useAuth();
	const [formData, setFormData] = useState({ username: '', password: '' });

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		await login(formData);
	};

	if (loading) return <p>Logging in...</p>;
	if (isAuthenticated()) return <p>Welcome back, {user?.username || user?.name}!</p>;

	return (
		<form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 p-6 border rounded shadow">
			<h2 className="text-xl font-semibold mb-4">Login</h2>
			
			<div className="mb-4">
				<label htmlFor="username" className="block mb-1">Username</label>
				<input
					type="text"
					id="username"
					name="username"
					value={formData.username}
					onChange={handleChange}
					className="w-full border p-2 rounded"
					required
				/>
			</div>

			<div className="mb-4">
				<label htmlFor="password" className="block mb-1">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					value={formData.password}
					onChange={handleChange}
					className="w-full border p-2 rounded"
					required
				/>
			</div>

			{error && <p className="text-red-500 mb-4">{error}</p>}

			<button
				type="submit"
				className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
			>
				Login
			</button>
		</form>
	);
}
