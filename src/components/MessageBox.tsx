export const MessageBox = ({ type, message, onClose }: { type: "success" | "error" | "warning" | "info", message: string, onClose?: () => void }) => {
    const styles = {
        success: 'bg-green-100 border-green-500 text-green-700',
        error: 'bg-red-100 border-red-500 text-red-700',
        warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
        info: 'bg-blue-100 border-blue-500 text-blue-700'
    }

    return (
        <div className={`border-l-4 p-4 mb-4 rounded-r-lg ${styles[type]} flex justify-between items-center`}>
            <span>{message}</span>
            <button
                onClick={onClose}
                className="text-current hover:text-opacity-75 focus:outline-none"
            >
                ×
            </button>
        </div>
    )
}