

const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center h-full min-h-[200px] w-full">
            <div className="relative w-12 h-12">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
