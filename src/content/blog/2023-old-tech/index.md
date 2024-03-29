---
slug: old-tech
title: Reviving old music gadgets for my son
subtitle: The journey to give my son access to music he loves in a offscreen, offline way
date: 2023-09-07
modified: 2023-09-08T21:31:22
---

My son recently turned 6, and like most kids, he loves music TV shows and movies. In addition to the TV in his playroom, he uses my iPad or phone to watch and listen to content. However, I wanted to provide him with access to music in a offscreen or offline way.

Since he was born, we've maintained a Spotify playlist of his favourite tracks, most of which come from movie soundtracks. His capacity to listen to certain tracks on repeat for hours on end is impressive. While "Sunflower" (from Spider-Man: Into the Spider-Verse soundtrack - a movie he adores) is a decent song, there's only so much repetition we can take.

<iframe width="560" height="315" src="https://www.youtube.com/embed/ApXoWvfEYVU?si=x0JE5MavSQgcD3HO" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

I wanted him to have some independence with his listening habits, so he didn’t have to rely on us all the time - and to not totally ruin my Spotify listening habits and recommendations 😄. What better way to do that than to give him what I had as a kid: a walkman. It just so happens that we had a working Sony Walkman that I gave to my wife a few years back, so I set about making my son's first mixtape.

![Sony Walkman](~/assets/old-tech/walkman.jpg)

After a lot of research, I finally bought the **Bush Cassette Player and Recorder**, some audio cassettes and a 3.5mm audio cable. It is not a good device but did what I wanted for a fairly inexpensive price. I hooked it up to my laptop, hit record to test the audio quality. It was awful. There was a lot of background noise and the music could hardly be made out.

A little searching around revealed that devices like this often produce noise when plugged in to mains, so I tried using battery power instead. It took 4 of those massive “C” batteries which I haven’t used in probably 20 years.

With the batteries in, I tested the recording for the 2nd time. The background noise was still there but not as much as before - it would have to do. About an hour later I had produced my son’s 1st mixtape, and the 1st mixtape I had made in over 25 years. I wrote the tracks on the card and gave it to him after he came back from school.

![the mixtape in all its glory](~/assets/old-tech/mixtape.jpg)

His Belkin Bluetooth headphones can also take a 3.5mm audio cable, so they were perfect to connect to the Walkman. It took him a little getting used to - loading the tapes and the concept of rewinding so he could replay the same track again - but after a while he could be seen wandering around listening to his mixtape all the time. It was a wonderful thing to see.

![my son using the walkman](~/assets/old-tech/son.jpg)

After the mixtape had been in use for a bit, I remembered I had an old iPod Shuffle lying around. Remember the tiny ones that clip to your clothes? The smaller form-factor and more modern tech meant that I could keep the quality high and he could still have the tracks that he loves with him at all times. The one snag with this was that I now only use Spotify and have very little music (mp3s etc) on my computer. So how do I get mp3s of all the songs? I turned to [yt-dlp](https://github.com/yt-dlp/yt-dlp) to convert YouTube music videos to mp3s.

Installing `yt-dlp` isn’t hard on a Mac if you have Homebrew (`brew install yt-dlp`) but there are many other installation instructions on its [GitHub repo](https://github.com/yt-dlp/yt-dlp).

Now all I had to do was to find the right YouTube video, copy the ID from the url and run the script below:

```bash
# yt-dlp {youtube id} -x --audio-format=mp3
yt-dlp oCcks-fwq2c -x --audio-format=mp3
```

Once all the tracks were saved, I uploaded them onto the shuffle.

The iPod shuffle was a massive success! It was much easier than the Walkman for him to learn and use, plus the quality was so much better. We took it with us on holiday to Spain recently and the kids from the other family also loved it so much that they fought over it a few times.. and “Sunflower” was on hard rotation there as well!!

So it seems that is the end of the journey... not quite. Downloading tracks from YouTube isn’t legal so I needed an alternative, and quick! As luck would have it I stumbled on a fairly new device called the [Mighty Vibe](https://www.mightyaudio.co.uk/products/mighty-vibe). It is very similar to the old iPod shuffle but plays Spotify or Amazon Music tracks instead. Using the smartphone app I can manage what is saved to the device. It has Bluetooth and can connect to a 3.5mm cable so it is perfect for our needs. It is the best of both worlds: a device without a screen that my son can use without fear of breaking. He can keep it for himself and do what he wants with it.

![product shot of the Mighty Vibe device](~/assets/old-tech/mighty-vibe.jpg)

Along the same lines as this, I have been resurrecting other “retro” things for my son to use like cameras, Game Boys and toys. If I get time, I’ll write about them too.
