
namespace SquaresRT
{
	/** */
	async function startup()
	{
		const feedLinkTag = document.head.querySelector("LINK[rel=feed]") as HTMLLinkElement;
		if (!feedLinkTag)
			return;
		
		const feedUrlText = feedLinkTag.href;
		if (!feedUrlText)
			return;
		
		const feedIndexUrl = new URL(feedUrlText, window.location.href).toString();
		const indexResult = await Webfeed.downloadIndex(feedIndexUrl);
		if (!indexResult)
			return; // Probably display some message here saying that the feed couldn't be loaded.
		
		const index = indexResult.index;
		const hero = document.querySelector("SECTION.hero") as HTMLElement;
		hero.style.removeProperty("display");
		
		const squares = new SquaresJS.Squares({
			maxPosterCount: index.length,
			headerElement: hero,
			viewportElement: document.body,
			requestPoster: position =>
			{
				if (position >= index.length)
					return null;
				
				return (async () =>
				{
					const pageUrl = index[position];
					const page = await Webfeed.downloadPage(pageUrl);
					if (!page || !page.poster || page.sections.length === 0)
						return Webfeed.getErrorPoster();
					
					posterSections.set(page.poster, {
						path: pageUrl,
						sections: page.sections,
					});
					
					return page.poster;
				})();
			},
			requestPlaceholder: () =>
			{
				return raw.div();
			},
			requestPage: (selectedElement: HTMLElement) =>
			{
				return posterSections.get(selectedElement)!;
			}
		});
		
		document.body.append(squares.head);
	}
	
	/** */
	interface IPageInfo
	{
		path: string;
		sections: HTMLElement[];
	}
	
	const posterSections = new WeakMap<HTMLElement, IPageInfo>();
	startup();
}
