import * as anchor from "@project-serum/anchor"
import { Program } from "@project-serum/anchor"
import { assert, expect } from "chai"
import { AnchorMovieReviewProgram } from "../target/types/anchor_movie_review_program"

describe("anchor-movie-review-program", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace
    .AnchorMovieReviewProgram as Program<AnchorMovieReviewProgram>

  const movie = {
    title: "Just a test movie",
    description: "Wow what a good movie it was real great",
    rating: 5,
  }
  const [moviePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(movie.title), provider.wallet.publicKey.toBuffer()],
    program.programId
  )

  it("Movie review is added`", async () => {
    // Add your test here.
    const tx = await program.methods
      .addMovieReview(movie.title, movie.description, movie.rating)
      .accounts({movieReview:moviePda})
      .rpc()

    const account = await program.account.movieAccountState.fetch(moviePda)
    expect(movie.title === account.title)
    expect(movie.rating === account.rating)
    expect(movie.description === account.description)
    expect(account.reviewer === provider.wallet.publicKey)
  })

  it("Movie review is updated`", async () => {
    const newDescription = "Wow this is new"
    const newRating = 4

    const tx = await program.methods
      .updateMovieReview(movie.title, newDescription, newRating)
      .accounts({movieReview:moviePda})
      .rpc()

    const account = await program.account.movieAccountState.fetch(moviePda)
    expect(movie.title === account.title)
    expect(newRating === account.rating)
    expect(newDescription === account.description)
    expect(account.reviewer === provider.wallet.publicKey)
  })

  it("Deletes a movie review", async () => {
    const tx = await program.methods.deleteMovieReview(movie.title).rpc()
  })
})