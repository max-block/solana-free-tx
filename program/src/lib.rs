use std::convert::TryInto;

use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
};
use solana_program::clock::Clock;
use solana_program::sysvar::Sysvar;

entrypoint!(process_instruction);

/// Accounts expected:
/// 0. `[signer, writable]` Debit lamports from this account
/// 1. `[writable]` Credit lamports to this account
/// 2. `[]` System program
/// 3. `[]` SysvarC1ock11111111111111111111111111111111
pub fn process_instruction(_program_id: &Pubkey, accounts: &[AccountInfo], input: &[u8]) -> ProgramResult {
    let acc_iter = &mut accounts.iter();
    let alice_info = next_account_info(acc_iter)?;
    let bob_info = next_account_info(acc_iter)?;
    let clock = Clock::get().unwrap();
    msg!("timestamp: {}", clock.unix_timestamp);

    if clock.unix_timestamp % 2 == 0 {
        let amount = input
            .get(..8)
            .and_then(|slice| slice.try_into().ok())
            .map(u64::from_le_bytes)
            .ok_or(ProgramError::InvalidInstructionData)?;

        invoke(
            &system_instruction::transfer(alice_info.key, bob_info.key, amount),
            &[alice_info.clone(), bob_info.clone()],
        )?;
        msg!("transfer {} lamports from {:?} to {:?}", amount, alice_info.key, bob_info.key);
    } else {
        msg!("don't want to transfer. yet....")
    }
    Ok(())
}
