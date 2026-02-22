export default function InfoGame(){
    return(
<div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto p-10
                bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
                rounded-3xl border border-white/10 shadow-2xl
                backdrop-blur-xl text-center">

    <h1 className="text-4xl font-extrabold text-white tracking-tight">
        Welcome to
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Football Manager
        </span>
    </h1>

    <h3 className="text-lg text-gray-300">
        On the left side you can see the menu
    </h3>

    <h3 className="text-lg text-gray-400">
        Get used to it and <strong>PLAY!</strong>
    </h3>
</div>

    );
}