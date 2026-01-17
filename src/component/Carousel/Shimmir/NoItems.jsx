const NoItems = () => {
    return (
        <div class="flex h-64 w-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center">
            <div class="mb-3 text-4xl">🎬</div>

            <p class="text-sm font-semibold text-gray-700">
                Nothing to display
            </p>

            <p class="mt-1 max-w-xs text-xs text-gray-500">
                This carousel is active, but no videos or widgets are available right now.
            </p>

            <p class="mt-3 text-xs text-gray-400">
                Content will appear here once available
            </p>
        </div>

    )
}

export default NoItems