'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import navigationOptions from '../../utils/navigation'
import { signOut } from 'next-auth/react';


interface ButtonData {
  buttontext: string;
  onClick?: () => {}
};

export const Button = (data: ButtonData)  => {
  return (
    <button
        type="button"
        onClick={data.onClick}
        className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >{data.buttontext}</button>
  )
}

export function Myheader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-gray-900">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex flex-1">
          <div className="hidden lg:flex lg:gap-x-12">
            {navigationOptions.map((item) => (
              <a key={item.name} href={item.href} className="hover:text-sky-700 text-sm font-semibold leading-6 text-gray-50">
                {item.name}
              </a>
            ))}
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-50"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
        <a href="/jukebox" className="-m-1.5 p-1.5">
          <img className="h-8 w-auto" src="/jukebox.png" alt="" />
        </a>
        <div className="flex flex-1 justify-end">
          <button
          type="button"
          className="hover:text-sky-700 text-sm font-semibold leading-6 text-gray-50"
          onClick={() => signOut({ callbackUrl: '/' })}
          >
            Sign out <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </nav>
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 left-0 z-10 w-full overflow-y-auto bg-gray-900 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-1">
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <a href="#" className="-m-1.5 p-1.5">
              <img className="h-8 w-auto" src="/jukebox.png" alt="" />
            </a>
            <div className="flex flex-1 justify-end">
            <button
            type="button"
            className="hover:text-sky-700 text-sm font-semibold leading-6 text-gray-50"
            onClick={() => signOut({ callbackUrl: '/' })}
            >
            Sign out <span aria-hidden="true">&rarr;</span>
          </button>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {navigationOptions.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-50 hover:text-sky-700"
              >
                {item.name}
              </a>
            ))}
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  )
}


export default Myheader;
