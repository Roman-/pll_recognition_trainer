# PLL algorithms

## Block position explanation
Some PLLs have a block or two. For example, U-perms have 1x3 block, J-perms have one 1x3 and one 1x2 block. A&V have two 1x2 blocks, Z,H,E dont have blocks.

I denote block position with two letters. BL means this: if PLL have only one block, it will be on the back. If two, they will be on the back and left sides. Examples for PLL cases with BL block:

- Ja will have 1x3 block on the back and 1x2 on the left; Jb - 1x3 on the left and 1x2 on the back
- A-perm will basically be a threecycle UFL -> UFR -> UBR
- U-perm will have its only block on the back. G-perms will also have their 1x2 blocks on the back.
- Z,H,E,N can be in any position

So the most difficult (and interesting) challenge here is to only generate PLLs with BL block and try to recognize it by two sides (only looking at front and right side). 

## algs structure
```
algs[name] = 
{
	no AUF: [array of algs that solve "name" case with block on BL]
	U: [array of algs that solve "name+U" case. "name+U" has block on RB]
	U2: [array of algs that solve "name+U2" case. "name+U2" has block on FR]
	U': [array of algs that solve "name+U`" case. "name+U`" has block on LF]
}
```
