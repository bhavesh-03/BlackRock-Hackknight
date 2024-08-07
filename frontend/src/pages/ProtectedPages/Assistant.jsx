import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import 'tailwindcss/tailwind.css'; // Ensure Tailwind CSS is imported
import { useGetAllExpensesQuery } from '../../features/api/apiSlices/expenseApiSlice';



const Assistant = () => {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const API_KEY = 'AIzaSyBGiZEA9xo-gn2Y4rnUHmcxeY5mEK5O4Us'; // Replace with your actual API key

    // Initialize GoogleGenerativeAI instance with API key
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const { data: expenseData, refetch: refetchExpenses } =
    useGetAllExpensesQuery();
    // Function to fetch expenses from the API
    const fetchExpenses = async () => {
        try {
            // const response = await fetch('http://localhost:3000/api/v1/expenses/all'); 
            await refetchExpenses();
            const data =expenseData; 
            console.log(data); 
            // Filter the data for the last month
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            const recentExpenses = data.expenses.filter(expense => new Date(expense.date) >= oneMonthAgo);

            // Format the data
            const formattedExpenses = recentExpenses.map(expense => `${expense.category.charAt(0).toUpperCase() + expense.category.slice(1)} ₹${expense.amount}`).join('\n');
            return formattedExpenses;
            
        } catch (error) {
            console.error('Error fetching expenses:', error);
            setError('Error fetching expenses. Please try again.');
            return '';
        }
    };

    // Function to handle question submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await model.generateContent(question);
            const response = await result.response;
            const text = await response.text();
            const plainText = text.replace(/[*#]/g, ''); // Remove markdown syntax

            // Process and format response
            const formattedResponse = formatResponse(plainText);

            setMessages([...messages, { type: 'user', text: question }]);

            // Display formatted response gradually
            for (let i = 0; i < formattedResponse.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Adjust delay time as needed
                setMessages(prevMessages => [...prevMessages, { type: 'bot', text: formattedResponse[i] }]);
            }

            setQuestion('');
        } catch (error) {
            console.error('Error generating content:', error);
            setError('Error generating answer. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Function to format response with italics, bold, etc.
    const formatResponse = (text) => {
        // Split text into paragraphs based on double newline
        const paragraphs = text.split(/\n{2,}/);

        // Apply formatting to each paragraph
        const formattedParagraphs = paragraphs.map(paragraph => {
            // Use regex to identify and format text within asterisks as bold
            let formattedText = paragraph.replace(/\*([^\*]+)\*/g, '<b>$1</b>');

            // Use regex to identify and format text within underscores as italic
            formattedText = formattedText.replace(/_([^_]+)_/g, '<i>$1</i>');

            return `<p>${formattedText}</p>`;
        });

        return formattedParagraphs;
    };

    // Function to handle "Manage My Expense" button click
    const handleManageExpense = async () => {
        const expenseData = await fetchExpenses();
        setQuestion(`These are my expenses for this month:\n${expenseData}\nPlease suggest how I can manage my expenses and save more.`);
    };

    return (
        <div className='max-w-3xl mx-56'>
            <div className="w-5xl mx-auto mt-10 bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-[#8BE4B1] p-4">
                    <h2 className="text-white text-2xl font-semibold">Your Assistant</h2>
                </div>
                <div className="p-4 h-96 overflow-y-auto">
                    {messages.map((message, index) => (
                        <div key={index} className={`my-2 p-2 block-inline rounded ${message.type === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'}`} dangerouslySetInnerHTML={{ __html: message.text }}></div>
                    ))}
                </div>
                <form onSubmit={handleSubmit} className="p-4 flex items-center">
                    <input
                        type="text"
                        placeholder="Type your question here..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="flex-1 p-2 border rounded border-gray-300 mr-2"
                        required
                    />
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-300" disabled={loading}>
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </form>
                <button
                    onClick={handleManageExpense}
                    className="bg-[#F87171] mx-72 mb-4 text-white p-2 rounded hover:bg-green-600 transition-colors duration-300 mt-2"
                >
                    Manage My Expense
                </button>
                {error && <p className="text-red-500 p-4">{error}</p>}
            </div>
        </div>
    );
};

export default Assistant;
